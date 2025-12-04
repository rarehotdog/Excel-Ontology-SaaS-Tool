import pandas as pd
from typing import List, Dict, Any

class SmartTransformer:
    def parse_reference(self, filename: str) -> Dict[str, Any]:
        """
        Parses a reference file (image or excel) to extract schema.
        MOCKED for now.
        """
        # In a real scenario, this would use GPT-4 Vision or OpenPyXL to analyze the file.
        # Returning a mock schema for a "Sales Report"
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
        Generates Pandas code to transform source data to target schema based on mapping.
        mapping: { "Target Field Name": "Source Column Name" }
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
        Executes the transformation.
        """
        # In a real app, we might use `exec` on the generated code, but for safety/simplicity here,
        # we'll just do the transformation directly using the logic.
        
        df_transformed = pd.DataFrame(index=df.index)
        for target, source in mapping.items():
            if source and source in df.columns:
                df_transformed[target] = df[source]
            else:
                df_transformed[target] = None
                
        return df_transformed
