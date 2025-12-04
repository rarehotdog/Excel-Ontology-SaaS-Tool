from fastapi import APIRouter
from app.services import lineage_tracker

router = APIRouter(tags=["lineage"])

@router.get("/lineage")
def get_lineage():
    return lineage_tracker.get_graph()
