from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services import processor, analytics_engine

router = APIRouter(prefix="/analytics", tags=["analytics"])

class AnalyticsRequest(BaseModel):
    file_id: str
    column: Optional[str] = None

class DistributionRequest(BaseModel):
    file_id: str
    column: str

@router.post("/summary")
async def get_analytics_summary(request: AnalyticsRequest):
    if request.file_id not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[request.file_id]
    return analytics_engine.generate_summary(df)

@router.post("/distribution")
async def get_column_distribution(request: DistributionRequest):
    if request.file_id not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[request.file_id]
    return analytics_engine.get_column_distribution(df, request.column)

@router.post("/correlation")
async def get_correlation_matrix(request: AnalyticsRequest):
    if request.file_id not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[request.file_id]
    return analytics_engine.calculate_correlations(df)
