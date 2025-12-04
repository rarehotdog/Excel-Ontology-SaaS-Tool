from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import Routers
from app.api.routers import data, etl, smart, analytics, export, dictionary, lineage, settlement, ontology, smart_transform

app = FastAPI(title="Excel Ontology API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(data.router) # /data/upload, /data/list
app.include_router(etl.router) # /etl/merge, /etl/anomaly, /etl/reconcile
app.include_router(smart.router) # /smart/..., /agent/...
app.include_router(analytics.router) # /analytics/...
app.include_router(export.router) # /export/...
app.include_router(dictionary.router) # /dictionary/...
app.include_router(lineage.router) # /lineage
app.include_router(settlement.router) # /settlement/...
app.include_router(ontology.router) # /ontology/...
app.include_router(smart_transform.router, prefix="/smart-transform", tags=["smart-transform"])

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Excel Ontology API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
