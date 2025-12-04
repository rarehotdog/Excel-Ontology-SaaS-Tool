from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.smart_transformer import SmartTransformer

router = APIRouter()
transformer = SmartTransformer()

class GenerateRequest(BaseModel):
    prompt: str
    # file_id: str  # Placeholder for future file integration

@router.post("/generate")
async def generate_pipeline(request: GenerateRequest):
    """
    Generates a pipeline plan and mock preview data based on the user's natural language prompt.
    """
    # 1. Generate a plan using the SmartTransformer (currently uses mock logic based on keywords)
    # In a real scenario, this would pass the actual file schema.
    mock_schema = {"fields": ["Date", "Dept", "Amount", "Status", "Region", "Category"]} 
    plan = transformer.generate_plan_from_prompt(request.prompt, mock_schema)
    
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
        "previewData": preview_data
    }
