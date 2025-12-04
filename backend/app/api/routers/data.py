from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import shutil
import os
from app.services import processor, lineage_tracker

router = APIRouter(prefix="/data", tags=["data"])

@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        temp_path = f"temp_{file.filename}"
        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            with open(temp_path, "rb") as f:
                meta = processor.load_file(f, file.filename)

            results.append(meta)

            # Track Lineage
            lineage_tracker.add_node(file.filename, "source", file.filename, {"size": file.size})
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    return {"uploaded": results}

@router.get("/list")
def list_data():
    files = []
    for filename, df in processor.data_store.items():
        meta = processor._extract_metadata(df, filename)
        files.append(meta)
    return files
