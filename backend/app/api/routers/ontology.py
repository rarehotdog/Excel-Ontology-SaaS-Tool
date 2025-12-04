from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services import processor, ontology_engine

router = APIRouter(prefix="/ontology", tags=["ontology"])

@router.post("/infer")
def infer_ontology():
    # Get metadata from all loaded files
    metadata_list = []
    for filename, df in processor.data_store.items():
        metadata_list.append({
            "filename": filename,
            "columns": list(df.columns),
            "shape": df.shape
        })
    
    try:
        concepts = ontology_engine.infer_concepts(metadata_list)
        snapshots = ontology_engine.infer_snapshots(metadata_list)
        return {
            "success": True, 
            "concepts": concepts, 
            "snapshots": snapshots
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/context")
def get_ontology_context():
    try:
        return ontology_engine.get_context()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
