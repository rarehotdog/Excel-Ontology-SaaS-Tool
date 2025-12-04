from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
from app.services import processor, smart_transformer, agent, lineage_tracker

router = APIRouter(tags=["smart"]) # Prefix handled individually or grouped

class ParseRequest(BaseModel):
    filename: str

class GenerateCodeRequest(BaseModel):
    mapping: Dict[str, str]
    source_filename: str

class TransformRequest(BaseModel):
    file_id: str
    mapping: Dict[str, str]
    output_name: str

class ChatRequest(BaseModel):
    message: str
    file_id: str
    context: Optional[Dict[str, Any]] = None

class ExecuteRequest(BaseModel):
    code: str
    file_id: str

class PlanRequest(BaseModel):
    prompt: str
    file_ids: List[str]

class ExecutePlanRequest(BaseModel):
    plan: Dict[str, Any]
    file_ids: List[str]

@router.post("/smart/parse")
def parse_reference(request: ParseRequest):
    try:
        schema = smart_transformer.parse_reference(request.filename)
        return {"success": True, "schema": schema}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/smart/generate")
def generate_code(request: GenerateCodeRequest):
    if request.source_filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="Source file not found")
    
    df = processor.data_store[request.source_filename]
    source_meta = {"columns": list(df.columns)}
    
    try:
        code = smart_transformer.generate_transform_code(request.mapping, source_meta)
        return {"success": True, "code": code}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/smart/transform")
def transform_data(request: TransformRequest):
    if request.file_id not in processor.data_store:
        raise HTTPException(status_code=404, detail="Source file not found")
    
    df = processor.data_store[request.file_id]
    
    try:
        result_df = smart_transformer.execute_transformation(df, request.mapping)
        
        output_filename = f"{request.output_name}.csv"
        processor.data_store[output_filename] = result_df
        
        result_json = result_df.head().to_dict(orient='records')
        
        # Lineage
        lineage_tracker.add_node(request.file_id, "source", request.file_id, {"rows": len(df)})
        transform_id = f"transform_{request.output_name}"
        lineage_tracker.add_node(transform_id, "transform", "Smart Transform", {"mapping": request.mapping})
        lineage_tracker.add_edge(request.file_id, transform_id, "Applied Mapping")
        lineage_tracker.add_node(output_filename, "output", output_filename, {"rows": len(result_df)})
        lineage_tracker.add_edge(transform_id, output_filename, "Generated")

        return {
            "success": True, 
            "metadata": {
                "filename": output_filename,
                "columns": list(result_df.columns),
                "shape": result_df.shape,
                "head": result_json
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/agent/chat")
async def chat_agent(request: ChatRequest):
    if request.file_id not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    plan = agent.generate_plan(request.message, [])
    code = agent.generate_code(request.message, plan, [])
    
    return {
        "response": "Here is the plan and code for your request.",
        "plan": plan,
        "code": code
    }

@router.post("/agent/execute")
async def execute_code(request: ExecuteRequest):
    if request.file_id not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[request.file_id].copy()
    code_content = request.code.replace("```python", "").replace("```", "").strip()
    
    local_vars = {"df": df, "pd": pd}
    try:
        exec(code_content, {}, local_vars)
        result_df = local_vars.get('df')
        
        if result_df is not None and isinstance(result_df, pd.DataFrame):
            result_data = result_df.head(20).replace({np.nan: None}).to_dict(orient='records')
            return {
                "success": True,
                "summary": f"Executed successfully. Result has {len(result_df)} rows.",
                "data": result_data
            }
        else:
            return {"success": False, "summary": "Code executed but 'df' variable was not found or not a DataFrame."}
    except Exception as e:
        return {"success": False, "summary": f"Error executing code: {str(e)}"}

@router.post("/smart/plan/generate")
def generate_plan(request: PlanRequest):
    # 1. Get Schema from first file (Mock)
    if not request.file_ids or request.file_ids[0] not in processor.data_store:
         raise HTTPException(status_code=404, detail="File not found")
         
    df = processor.data_store[request.file_ids[0]]
    schema = {"columns": list(df.columns)}
    
    try:
        plan = smart_transformer.generate_plan_from_prompt(request.prompt, schema)
        return {"success": True, "plan": plan}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/smart/plan/execute")
def execute_plan(request: ExecutePlanRequest):
    if not request.file_ids or request.file_ids[0] not in processor.data_store:
         raise HTTPException(status_code=404, detail="File not found")
         
    df = processor.data_store[request.file_ids[0]]
    
    try:
        results = smart_transformer.execute_plan(df, request.plan)
        
        # Convert results to JSON for preview
        preview = {}
        for table_id, res_df in results.items():
            preview[table_id] = {
                "columns": list(res_df.columns),
                "data": res_df.head(20).replace({np.nan: None}).to_dict(orient='records')
            }
            
        return {"success": True, "results": preview}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
