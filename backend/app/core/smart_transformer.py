import pandas as pd
from typing import List, Dict, Any, Optional
import json

class SmartTransformer:
    def parse_reference(self, filename: str) -> Dict[str, Any]:
        """
        Parses a reference file (image or excel) to extract schema.
        MOCKED for now.
        """
        return {
            "name": "Standard Sales Report",
            "fields": [
                {"name": "Transaction Date", "type": "date", "description": "Date of the transaction"},
                {"name": "Merchant Name", "type": "string", "description": "Name of the merchant"},
                {"name": "Amount", "type": "number", "description": "Transaction amount"},
                {"name": "Category", "type": "string", "description": "Expense category"},
                {"name": "Status", "type": "string", "description": "Payment status"}
            ]
        }

    def generate_transform_code(self, mapping: Dict[str, str], source_meta: Dict[str, Any]) -> str:
        """
        Legacy method for simple column mapping.
        """
        code_lines = [
            "import pandas as pd",
            "",
            "def transform(df):",
            "    # Select and rename columns based on mapping",
            "    df_transformed = pd.DataFrame(index=df.index)",
        ]

        for target, source in mapping.items():
            if source:
                code_lines.append(f"    if '{source}' in df.columns:")
                code_lines.append(f"        df_transformed['{target}'] = df['{source}']")
            else:
                code_lines.append(f"    df_transformed['{target}'] = None # Missing mapping")

        code_lines.append("")
        code_lines.append("    return df_transformed")
        
        return "\n".join(code_lines)

    def execute_transformation(self, df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
        """
        Legacy method for simple execution.
        """
        df_transformed = pd.DataFrame(index=df.index)
        for target, source in mapping.items():
            if source and source in df.columns:
                df_transformed[target] = df[source]
            else:
                df_transformed[target] = None
                
        return df_transformed

    # --- Magic Editor 2.0 Logic ---

    def generate_plan_from_prompt(self, prompt: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a structured transformation plan based on user prompt and schema.
        MOCKED to return the structure defined in the spec.
        """
        # In a real implementation, this would call an LLM with the prompt and schema.
        # Here we return a mock plan based on keywords in the prompt.
        
        plan = {
            "tables": [],
            "layout": {"type": "REPORT", "sections": []}
        }
        
        if "합계표" in prompt or "summary" in prompt.lower():
            plan["tables"].append({
                "id": "summary_table",
                "title": "Summary Table",
                "operations": [
                    { 
                        "type": "GROUP_BY",
                        "keys": ["Category"] if "Category" in str(schema) else ["Region"], # Mock logic
                        "aggregations": [
                            { "field": "Amount", "op": "SUM", "as": "Total Amount" }
                        ]
                    },
                    { "type": "ORDER_BY", "field": "Total Amount", "direction": "DESC" }
                ]
            })
            plan["layout"]["sections"].append({"id": "sec1", "title": "Summary", "content": ["summary_table"]})
            
        if "상세" in prompt or "detail" in prompt.lower():
             plan["tables"].append({
                "id": "detail_table",
                "title": "Detail Table",
                "operations": [
                    { 
                        "type": "SELECT",
                        "fields": ["Date", "Merchant", "Amount", "Status"] # Mock fields
                    },
                     { "type": "ORDER_BY", "field": "Date", "direction": "DESC" }
                ]
            })
             plan["layout"]["sections"].append({"id": "sec2", "title": "Details", "content": ["detail_table"]})
             
        # Default if no keywords
        if not plan["tables"]:
             plan["tables"].append({
                "id": "default_table",
                "title": "Transformed Data",
                "operations": [
                    { "type": "SELECT", "fields": [] } # Select all
                ]
            })
             plan["layout"]["sections"].append({"id": "sec1", "title": "Data", "content": ["default_table"]})

        return plan

    def execute_plan(self, df: pd.DataFrame, plan: Dict[str, Any]) -> Dict[str, pd.DataFrame]:
        """
        Executes the plan on the provided DataFrame.
        Returns a dictionary of {table_id: result_dataframe}.
        """
        results = {}
        
        for table in plan.get("tables", []):
            temp_df = df.copy()
            
            for op in table.get("operations", []):
                if op["type"] == "GROUP_BY":
                    keys = [k for k in op["keys"] if k in temp_df.columns]
                    if keys:
                        aggs = {}
                        rename_map = {}
                        for agg in op["aggregations"]:
                            if agg["field"] in temp_df.columns:
                                aggs[agg["field"]] = agg["op"].lower() # sum, mean, etc.
                                rename_map[agg["field"]] = agg["as"]
                        
                        if aggs:
                            temp_df = temp_df.groupby(keys).agg(aggs).reset_index()
                            temp_df = temp_df.rename(columns=rename_map)
                            
                elif op["type"] == "ORDER_BY":
                    field = op["field"]
                    ascending = op.get("direction", "ASC").upper() == "ASC"
                    if field in temp_df.columns:
                        temp_df = temp_df.sort_values(by=field, ascending=ascending)
                        
                elif op["type"] == "FILTER":
                    # Simple equality filter for now
                    field = op["field"]
                    value = op["value"]
                    if field in temp_df.columns:
                        temp_df = temp_df[temp_df[field] == value]
                        
                elif op["type"] == "SELECT":
                    fields = [f for f in op.get("fields", []) if f in temp_df.columns]
                    if fields:
                        temp_df = temp_df[fields]

            results[table["id"]] = temp_df
            
        return results
