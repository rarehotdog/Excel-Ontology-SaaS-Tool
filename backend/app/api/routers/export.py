from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.services import processor

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/download")
def download_file(filename: str, format: str = "csv"):
    if filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[filename]
    
    if format.lower() == "excel":
        output_filename = f"download_{filename.split('.')[0]}.xlsx"
        df.to_excel(output_filename, index=False)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif format.lower() == "json":
        output_filename = f"download_{filename.split('.')[0]}.json"
        df.to_json(output_filename, orient="records", indent=2)
        media_type = "application/json"
    else:
        output_filename = f"download_{filename.split('.')[0]}.csv"
        df.to_csv(output_filename, index=False)
        media_type = "text/csv"
        
    return FileResponse(
        path=output_filename, 
        filename=output_filename, 
        media_type=media_type
    )
