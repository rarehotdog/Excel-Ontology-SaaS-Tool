from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class StandardTerm(BaseModel):
    id: str
    name: str
    description: str
    data_type: str
    aliases: List[str]

class ValidationRule(BaseModel):
    id: str
    name: str
    description: str
    rule_type: str # e.g., 'regex', 'range', 'enum'
    parameters: Dict[str, Any]

class DataDictionary:
    def __init__(self):
        # Seed with some example data
        self.terms: List[StandardTerm] = [
            StandardTerm(
                id="term_1", 
                name="Customer ID", 
                description="Unique identifier for a customer", 
                data_type="string", 
                aliases=["cust_id", "c_id", "customer_code"]
            ),
            StandardTerm(
                id="term_2", 
                name="Transaction Amount", 
                description="Value of the transaction in local currency", 
                data_type="number", 
                aliases=["amount", "amt", "total_price", "price"]
            ),
            StandardTerm(
                id="term_3", 
                name="Email Address", 
                description="Customer contact email", 
                data_type="email", 
                aliases=["email", "e-mail", "contact_email"]
            )
        ]
        self.rules: List[ValidationRule] = [
            ValidationRule(
                id="rule_1",
                name="Positive Number",
                description="Value must be greater than 0",
                rule_type="range",
                parameters={"min": 0}
            )
        ]

    def get_terms(self) -> List[Dict[str, Any]]:
        return [term.dict() for term in self.terms]

    def add_term(self, term_data: Dict[str, Any]) -> StandardTerm:
        term = StandardTerm(**term_data)
        self.terms.append(term)
        return term

    def get_rules(self) -> List[Dict[str, Any]]:
        return [rule.dict() for rule in self.rules]

    def add_rule(self, rule_data: Dict[str, Any]) -> ValidationRule:
        rule = ValidationRule(**rule_data)
        self.rules.append(rule)
        return rule
