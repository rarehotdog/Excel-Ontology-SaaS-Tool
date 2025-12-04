from fastapi import APIRouter
from typing import Dict, Any
from app.services import data_dictionary

router = APIRouter(prefix="/dictionary", tags=["dictionary"])

@router.get("/terms")
def get_terms():
    return data_dictionary.get_terms()

@router.post("/terms")
def add_term(term: Dict[str, Any]):
    return data_dictionary.add_term(term)

@router.get("/rules")
def get_rules():
    return data_dictionary.get_rules()
