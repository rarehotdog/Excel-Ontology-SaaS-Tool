from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services import processor, analytics_engine
from app.core.agent import LLMAgent

router = APIRouter(prefix="/analytics", tags=["analytics"])
agent = LLMAgent()

class AnalyticsRequest(BaseModel):
    file_id: str
    column: Optional[str] = None

class DistributionRequest(BaseModel):
    file_id: str
    column: str

class AnalysisRequest(BaseModel):
    filenames: List[str]

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

@router.post("/initial")
async def initial_analysis(request: AnalysisRequest):
    """
    Generate initial insights for selected files - compatible with frontend
    """
    metadata_list = []
    target_files = set(request.filenames)
    
    for filename, df in processor.data_store.items():
        if filename in target_files:
            # Extract metadata
            meta = {
                "filename": filename,
                "columns": list(df.columns),
                "shape": df.shape,
                "head": df.head().to_dict(orient='records')
            }
            metadata_list.append(meta)
    
    if not metadata_list:
        return {
            "insights": ["선택된 파일에 대한 메타데이터를 찾을 수 없습니다."],
            "trend_data": [],
            "kpi_metrics": [],
            "chart_metadata": {}
        }
    
    # Pass data_store to agent for real data processing
    result = agent.generate_insights(metadata_list, processor.data_store)
    return result
