import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

class FieldRef(BaseModel):
    source_id: str
    sheet_name: str
    column_name: str

class OntologyConcept(BaseModel):
    id: str
    label: str
    type: str # "entity", "metric", "time", "enum"
    field_refs: List[FieldRef] = []
    examples: List[str] = []

class Snapshot(BaseModel):
    id: str
    label: str
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    source_refs: List[FieldRef] = []

class DecisionTemplate(BaseModel):
    id: str
    name: str
    decision: str
    impact_metrics: List[str] # concept ids
    dimensions: List[str] # concept ids
    time_scope: str # "month_over_month", "range"

class OntologyEngine:
    def __init__(self):
        self.concepts: Dict[str, OntologyConcept] = {}
        self.snapshots: List[Snapshot] = []
        self.decision_templates: List[DecisionTemplate] = []
        self._initialize_defaults()

    def _initialize_defaults(self):
        # Pre-seed with some common concepts
        defaults = [
            ("branch", "Branch", "entity", ["지역본부", "본부명", "Branch"]),
            ("merchant", "Merchant", "entity", ["가맹점명", "점포명", "지점명", "MerchantName"]),
            ("vehicle", "Vehicle", "entity", ["차량번호", "PlateNo", "CarNum"]),
            ("driver", "Driver", "entity", ["기사명", "DriverName"]),
            ("time", "Time", "time", ["정산월", "yyyyMM", "Date", "승인시각", "Time"]),
            ("fare_metric", "Fare", "metric", ["운임", "매출금액", "Fare", "Revenue"]),
            ("fee_metric", "Service Fee", "metric", ["서비스이용료", "수수료", "Fee"]),
        ]
        for cid, label, ctype, keywords in defaults:
            self.concepts[cid] = OntologyConcept(id=cid, label=label, type=ctype, examples=keywords)

        # Pre-seed decision templates
        self.decision_templates.append(DecisionTemplate(
            id="dt_1",
            name="Monthly Revenue/Margin Analysis",
            decision="Which branch needs management focus?",
            impact_metrics=["fare_metric", "fee_metric"],
            dimensions=["branch"],
            time_scope="month_over_month"
        ))

    def infer_concepts(self, metadata_list: List[Dict[str, Any]]) -> List[OntologyConcept]:
        """
        Scan metadata (files/columns) and map them to existing concepts.
        """
        # Reset field refs for demo purposes (in real app, merge)
        for c in self.concepts.values():
            c.field_refs = []

        for file_meta in metadata_list:
            filename = file_meta.get("filename", "")
            # Mock: assuming single sheet or flattening columns
            columns = file_meta.get("columns", [])
            
            for col in columns:
                # Heuristic matching
                matched = False
                for concept in self.concepts.values():
                    # Check against examples/keywords
                    for keyword in concept.examples:
                        if keyword.lower() in col.lower():
                            concept.field_refs.append(FieldRef(
                                source_id=filename,
                                sheet_name="Sheet1", # Mock
                                column_name=col
                            ))
                            matched = True
                            break
                    if matched:
                        break
        
        return list(self.concepts.values())

    def infer_snapshots(self, metadata_list: List[Dict[str, Any]]) -> List[Snapshot]:
        """
        Infer time snapshots from filenames.
        """
        snapshots = []
        for file_meta in metadata_list:
            filename = file_meta.get("filename", "")
            
            # Regex for YYYY_MM or YYYY-MM
            match = re.search(r"(\d{4})[-_](\d{2})", filename)
            if match:
                year, month = match.groups()
                sid = f"{year}-{month}"
                
                # Check if snapshot exists
                existing = next((s for s in snapshots if s.id == sid), None)
                if not existing:
                    existing = Snapshot(
                        id=sid,
                        label=f"{year}-{month} Snapshot",
                        period_start=f"{year}-{month}-01",
                        period_end=f"{year}-{month}-30" # Simple mock
                    )
                    snapshots.append(existing)
                
                # Add ref
                existing.source_refs.append(FieldRef(
                    source_id=filename,
                    sheet_name="Sheet1",
                    column_name="*"
                ))
        
        self.snapshots = snapshots
        return snapshots

    def get_context(self):
        return {
            "concepts": list(self.concepts.values()),
            "snapshots": self.snapshots,
            "decision_templates": self.decision_templates
        }
