from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import pandas as pd
import numpy as np

from app.services import processor, smart_transformer

# Prefix and tags are applied in app.main when including this router.
router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str


class ExecuteRequest(BaseModel):
    """
    Execute a smart transform against an already-uploaded file.
    """
    prompt: str
    filename: str

@router.post("/generate")
async def generate_pipeline(request: GenerateRequest):
    """
    Generates a pipeline plan and mock preview data based on the user's natural language prompt.
    """
    # 1. Generate a plan using the SmartTransformer (currently uses mock logic based on keywords)
    # In a real scenario, this would pass the actual file schema.
    mock_schema = {"fields": ["Date", "Dept", "Amount", "Status", "Region", "Category"]}
    plan = smart_transformer.generate_plan_from_prompt(request.prompt, mock_schema)
    
    # 2. Convert the plan into frontend-compatible Node and Edge structures
    nodes = []
    edges = []
    
    # Fixed Input Node
    nodes.append({
        "id": "source-1", 
        "type": "source", 
        "label": "Data Source", 
        "x": 100, 
        "y": 180, 
        "data": {"icon": "Database"}
    })
    
    last_node_id = "source-1"
    x_pos = 320
    
    # Generate Transform Nodes from the plan's tables
    # We assume a linear flow for simplicity in this mock
    for idx, table in enumerate(plan.get("tables", [])):
        # Skip default table if we have specific ones, or handle logic as needed
        if table["id"] == "default_table" and len(plan["tables"]) > 1:
            continue
            
        node_id = f"transform-{idx}"
        
        # Determine icon based on operation type
        icon = "Filter"
        ops = table.get("operations", [])
        if ops:
            first_op = ops[0]["type"]
            if first_op == "GROUP_BY":
                icon = "GitMerge"
            elif first_op == "ORDER_BY":
                icon = "ListOrdered" # Or similar
            elif first_op == "CALCULATE": # Mock type
                icon = "Calculator"
        
        nodes.append({
            "id": node_id, 
            "type": "transform", 
            "label": table["title"],
            "x": x_pos, 
            "y": 180, 
            "data": {"icon": icon}
        })
        
        edges.append({"from": last_node_id, "to": node_id})
        last_node_id = node_id
        x_pos += 220
        
    # Fixed Output Node
    nodes.append({
        "id": "export-1", 
        "type": "output", 
        "label": "Export Result",
        "x": x_pos, 
        "y": 180, 
        "data": {"icon": "Download"}
    })
    edges.append({"from": last_node_id, "to": "export-1"})

    # 3. Generate Mock Preview Data based on the prompt context
    # This simulates "actual" data processing result
    preview_data = []
    
    if "그룹" in request.prompt or "group" in request.prompt.lower():
        preview_data = [
            {"dept": "Engineering", "count": 15, "total_budget": 250000, "avg_util": "88%"},
            {"dept": "Sales", "count": 12, "total_budget": 180000, "avg_util": "92%"},
            {"dept": "Marketing", "count": 8, "total_budget": 120000, "avg_util": "85%"},
            {"dept": "HR", "count": 5, "total_budget": 80000, "avg_util": "75%"},
        ]
    elif "필터" in request.prompt or "filter" in request.prompt.lower():
        preview_data = [
            {"date": "2023-10-01", "dept": "Engineering", "status": "Critical", "amount": 5000},
            {"date": "2023-10-05", "dept": "Engineering", "status": "Critical", "amount": 3200},
            {"date": "2023-10-12", "dept": "DevOps", "status": "Critical", "amount": 4500},
        ]
    else:
        # Default mock data
        preview_data = [
            {"dept": "Engineering", "status": "In Progress", "count": 12, "budget": 150000, "util": "85%"},
            {"dept": "Marketing", "status": "In Progress", "count": 8, "budget": 85000, "util": "92%"},
            {"dept": "Sales", "status": "In Progress", "count": 15, "budget": 120000, "util": "78%"},
            {"dept": "HR", "status": "In Progress", "count": 4, "budget": 45000, "util": "65%"},
            {"dept": "Finance", "status": "In Progress", "count": 6, "budget": 95000, "util": "88%"},
        ]

    return {
        "nodes": nodes,
        "connections": edges,
        "previewData": preview_data,
        "plan": plan,
    }


@router.post("/execute")
async def execute_transform(request: ExecuteRequest):
    """
    Execute a smart transform plan directly on an uploaded file and
    return a preview of the transformed data.

    This uses the same planning logic as /generate, but actually runs
    the operations against a DataFrame stored in processor.data_store.
    """
    if request.filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")

    df = processor.data_store[request.filename]

    # Build a simple schema description from the DataFrame
    schema = {
        "fields": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "shape": df.shape,
    }

    # 1) Plan from prompt + schema
    plan = smart_transformer.generate_plan_from_prompt(request.prompt, schema)

    # 2) Execute plan
    results = smart_transformer.execute_plan(df, plan)

    # Pick the first non-empty table as the main result, otherwise fall back
    preview_df: pd.DataFrame | None = None
    output_name = f"smart_{request.filename}"

    for table_id, table_df in results.items():
        if table_df is not None and not table_df.empty:
            preview_df = table_df
            output_name = f"{table_id}_{request.filename}"
            break

    if preview_df is None:
        preview_df = df.copy()

    # Store the transformed result so it can be exported later (raw types 유지)
    processor.data_store[output_name] = preview_df

    # ---- Build display-friendly preview (dates / KRW formatting) ----
    preview_df_display = preview_df.head(50).copy()

    # 1) Datetime columns → 'YYYY-MM-DD' 문자열로 변환
    for col in preview_df_display.columns:
        series = preview_df_display[col]
        try:
            if pd.api.types.is_datetime64_any_dtype(series) or pd.api.types.is_datetime64tz_dtype(series):
                preview_df_display[col] = pd.to_datetime(series, errors="coerce").dt.strftime("%Y-%m-%d")
            elif series.dtype == object:
                parsed = pd.to_datetime(series, errors="coerce")
                # 절반 이상이 날짜로 파싱되면 날짜 컬럼으로 간주
                if parsed.notna().sum() >= max(1, len(parsed) // 2):
                    preview_df_display[col] = parsed.dt.strftime("%Y-%m-%d")
        except Exception:
            # 날짜 변환 실패 시 원본 유지
            continue

    # 2) 원화(금액) 컬럼 → 천단위 콤마가 있는 문자열로 변환
    currency_tokens = ["amount", "금액", "price", "비용", "amt"]
    for col in preview_df_display.columns:
        col_l = str(col).lower()
        if any(tok in col_l for tok in currency_tokens) and pd.api.types.is_numeric_dtype(preview_df_display[col]):
            def _fmt_krw(v):
                if v is None or (isinstance(v, float) and np.isnan(v)):
                    return None
                try:
                    return f"{int(round(float(v))):,}"
                except Exception:
                    return v
            preview_df_display[col] = preview_df_display[col].apply(_fmt_krw)

    # JSON-serializable preview
    safe_preview = preview_df_display.replace({np.nan: None, pd.NaT: None})
    preview_data = safe_preview.to_dict(orient="records")

    return {
        "success": True,
        "outputFilename": output_name,
        "previewData": preview_data,
        "plan": plan,
    }
