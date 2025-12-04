from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services import processor, franchise_settlement, biz_settlement

router = APIRouter(prefix="/settlement", tags=["settlement"])

class FranchiseCheckRequest(BaseModel):
    admin_file: str
    call_file: Optional[str] = None
    payment_file: Optional[str] = None
    billing_file: Optional[str] = None

class BizCompareRequest(BaseModel):
    file_a: str
    file_b: str
    keys: List[str]

class BizReaggregateRequest(BaseModel):
    file_a: str
    file_b: str
    keys: List[str]
    filters: Dict[str, Any]

@router.post("/franchise/check")
def check_franchise_integrity(request: FranchiseCheckRequest):
    if request.admin_file not in processor.data_store:
        raise HTTPException(status_code=404, detail="Admin file not found")
    
    admin_df = processor.data_store[request.admin_file]
    call_df = processor.data_store.get(request.call_file) if request.call_file else None
    payment_df = processor.data_store.get(request.payment_file) if request.payment_file else None
    billing_df = processor.data_store.get(request.billing_file) if request.billing_file else None
    
    try:
        results = franchise_settlement.check_integrity(admin_df, call_df, payment_df, billing_df)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/biz/compare")
def compare_biz_files(request: BizCompareRequest):
    if request.file_a not in processor.data_store or request.file_b not in processor.data_store:
        raise HTTPException(status_code=404, detail="One or both files not found")
    
    df_a = processor.data_store[request.file_a]
    df_b = processor.data_store[request.file_b]
    
    try:
        results = biz_settlement.compare_with_reasoning(df_a, df_b, request.keys)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/biz/reaggregate")
def reaggregate_biz_files(request: BizReaggregateRequest):
    if request.file_a not in processor.data_store or request.file_b not in processor.data_store:
        raise HTTPException(status_code=404, detail="One or both files not found")
    
    df_a = processor.data_store[request.file_a]
    df_b = processor.data_store[request.file_b]
    
    try:
        results = biz_settlement.reaggregate_and_compare(df_a, df_b, request.keys, request.filters)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
