from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import shutil
import os
import json
import pandas as pd
from app.core.processor import DataProcessor
from app.core.agent import LLMAgent
from app.core.etl_pipeline import ETLPipeline
from app.core.anomaly import AnomalyDetector
from app.core.reconciliation import Reconciler
from app.core.smart_transformer import SmartTransformer

app = FastAPI(title="Excel Ontology API")

# ... (CORS setup)

# Global State
processor = DataProcessor()
agent = LLMAgent()
etl = ETLPipeline()
anomaly_detector = AnomalyDetector()
reconciler = Reconciler()
smart_transformer = SmartTransformer()

class MergeRequest(BaseModel):
    filenames: List[str]
    output_name: str = "merged_dataset"

class AnomalyRequest(BaseModel):
    filename: str
    rules: Dict[str, Any]

class ReconcileRequest(BaseModel):
    internal_filename: str
    external_filename: str
    key_columns: List[str]
    value_columns: List[str]

class ParseRequest(BaseModel):
    filename: str

class GenerateCodeRequest(BaseModel):
    mapping: Dict[str, str]
    source_filename: str

class TransformRequest(BaseModel):
    source_filename: str
    mapping: Dict[str, str]
    output_name: str

# ... (existing endpoints)

@app.post("/etl/anomaly")
def detect_anomalies(request: AnomalyRequest):
    if request.filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[request.filename]
    try:
        results = anomaly_detector.check_rules(df, request.rules)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/etl/reconcile")
def reconcile_data(request: ReconcileRequest):
    if request.internal_filename not in processor.data_store or request.external_filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="One or both files not found")
    
    df_int = processor.data_store[request.internal_filename]
    df_ext = processor.data_store[request.external_filename]
    
    try:
        results = reconciler.reconcile_datasets(
            df_int, 
            df_ext, 
            request.key_columns, 
            request.value_columns
        )
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/smart/parse")
def parse_reference(request: ParseRequest):
    # In real app, we would check if file exists or handle upload
    try:
        schema = smart_transformer.parse_reference(request.filename)
        return {"success": True, "schema": schema}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/smart/generate")
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

@app.post("/smart/transform")
def transform_data(request: TransformRequest):
    if request.source_filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="Source file not found")
    
    df = processor.data_store[request.source_filename]
    
    try:
        result_df = smart_transformer.execute_transformation(df, request.mapping)
        
        # Save result
        output_filename = f"{request.output_name}.csv"
        processor.data_store[output_filename] = result_df
        
        # Convert to JSON for preview
        result_json = result_df.head().to_dict(orient='records')
        
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

@app.post("/etl/merge")
def merge_data(request: MergeRequest):
    try:
        merged_df = etl.merge_files(processor.data_store, request.filenames)
        
        # Store result back to processor
        output_name = f"{request.output_name}.csv" # Force CSV for simplicity
        processor.data_store[output_name] = merged_df
        
        # Return metadata
        meta = processor._extract_metadata(merged_df, output_name)
        return {"success": True, "metadata": meta}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Added 5173 for Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State (Simple for single-user local app)
processor = DataProcessor()
agent = LLMAgent()

class ChatRequest(BaseModel):
    message: str

class AnalysisRequest(BaseModel):
    filenames: List[str]

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Excel Ontology API"}

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        # Save temp file
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Load into processor (it handles file reading)
        with open(temp_path, "rb") as f:
            # Create a mock object with .name and .read/getvalue
            # Or just pass the open file object, but we need to ensure it stays open if needed?
            # Processor reads it immediately.
            # setattr(f, 'name', file.filename) # Removed causing AttributeError
            meta = processor.load_file(f, file.filename)
            results.append(meta)
            
        # Cleanup temp
        os.remove(temp_path)
        
    return {"uploaded": results}

@app.get("/data/list")
def list_data():
    files = []
    for filename, df in processor.data_store.items():
        meta = processor._extract_metadata(df, filename)
        files.append(meta)
    return files

@app.post("/analyze/propose")
def propose_analysis():
    metadata_list = []
    for filename, df in processor.data_store.items():
        metadata_list.append(processor._extract_metadata(df, filename))
    
    if not metadata_list:
        return {"proposals": [], "insights": []}
        
    proposals = agent.propose_analysis(metadata_list)
    insights = agent.generate_insights(metadata_list)
    
    return {"proposals": proposals, "insights": insights}

@app.post("/chat")
def chat(request: ChatRequest):
    metadata_list = []
    for filename, df in processor.data_store.items():
        metadata_list.append(processor._extract_metadata(df, filename))
        
    prompt = request.message
    
    # 1. Plan
    plan = agent.generate_plan(prompt, metadata_list)
    
    # 2. Code
    code = agent.generate_code(prompt, plan, metadata_list)
    
    # Clean code
    import re
    match = re.search(r"```python\n(.*?)```", code, re.DOTALL)
    if match:
        code = match.group(1).strip()
    else:
        code = code.strip().replace("```python", "").replace("```", "")
        
    # 3. Execute
    exec_result = processor.execute_code(code, metadata=metadata_list)
    
    response = {
        "plan": plan,
        "code": code,
        "success": exec_result["success"]
    }
    
    if exec_result["success"]:
        result = exec_result["result"]
        summary = agent.generate_summary(prompt, result)
        response["summary"] = summary
        
        if isinstance(result, pd.DataFrame):
            # Convert DF to JSON for frontend
            response["data"] = json.loads(result.to_json(orient="records"))
            response["columns"] = list(result.columns)
        elif isinstance(result, (int, float, str, bool)):
            response["result_value"] = result
    else:
        response["error"] = exec_result["error"]
        
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
