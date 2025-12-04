from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services import processor, etl, anomaly_detector, reconciler, lineage_tracker

router = APIRouter(prefix="/etl", tags=["etl"])

class MergeRequest(BaseModel):
    filenames: List[str]
    output_name: str = "merged_dataset"

class AnomalyRequest(BaseModel):
    filename: str
    rules: Optional[Dict[str, Any]] = None

class ReconcileRequest(BaseModel):
    internal_filename: str
    external_filename: str
    mapping: Dict[str, Dict[str, str]]

@router.post("/merge")
def merge_data(request: MergeRequest):
    try:
        merged_df = etl.merge_files(processor.data_store, request.filenames)
        
        output_name = f"{request.output_name}.csv"
        processor.data_store[output_name] = merged_df
        
        meta = processor._extract_metadata(merged_df, output_name)
        
        # Lineage
        merge_node_id = f"merge_{output_name}"
        lineage_tracker.add_node(merge_node_id, "transform", "Merge Files", {"files": request.filenames})
        
        for fname in request.filenames:
            lineage_tracker.add_node(fname, "source", fname)
            lineage_tracker.add_edge(fname, merge_node_id, "Merged")
            
        lineage_tracker.add_node(output_name, "output", output_name, {"rows": len(merged_df)})
        lineage_tracker.add_edge(merge_node_id, output_name, "Result")
        
        return {"success": True, "metadata": meta}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/anomaly")
def detect_anomalies(request: AnomalyRequest):
    if request.filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[request.filename]
    try:
        # If rules are not provided, infer sensible defaults from the data itself.
        rules = request.rules or anomaly_detector.infer_rules(df)
        results = anomaly_detector.check_rules(df, rules)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reconcile")
def reconcile_data(request: ReconcileRequest):
    if request.internal_filename not in processor.data_store or request.external_filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="One or both files not found")
    
    df_int = processor.data_store[request.internal_filename]
    df_ext = processor.data_store[request.external_filename]
    
    try:
        results = reconciler.reconcile_datasets(
            df_int, 
            df_ext, 
            request.mapping
        )
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
