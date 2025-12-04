import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

class AnalyticsEngine:
    def generate_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generates a high-level summary of the dataframe.
        """
        summary = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": [],
            "missing_values": int(df.isnull().sum().sum()),
            "completeness": round((1 - (df.isnull().sum().sum() / (len(df) * len(df.columns)))) * 100, 2) if len(df) > 0 else 0
        }

        for col in df.columns:
            col_data = df[col]
            col_info = {
                "name": col,
                "type": str(col_data.dtype),
                "missing": int(col_data.isnull().sum()),
                "unique": int(col_data.nunique()),
            }
            summary["columns"].append(col_info)

        return summary

    def get_column_distribution(self, df: pd.DataFrame, column: str) -> Dict[str, Any]:
        """
        Calculates distribution for a specific column.
        - Categorical: Value counts (top 10)
        - Numerical: Histogram bins
        """
        if column not in df.columns:
            return {"error": f"Column {column} not found"}

        col_data = df[column]
        
        # Check if numerical
        if pd.api.types.is_numeric_dtype(col_data):
            # Drop NaNs for calculation
            clean_data = col_data.dropna()
            if len(clean_data) == 0:
                return {"type": "numeric", "data": []}
                
            # Create histogram bins
            try:
                hist, bin_edges = np.histogram(clean_data, bins='auto')
                data = []
                for i in range(len(hist)):
                    data.append({
                        "name": f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}",
                        "value": int(hist[i])
                    })
                return {"type": "numeric", "data": data}
            except Exception as e:
                return {"error": str(e)}
        else:
            # Categorical
            value_counts = col_data.value_counts().head(10)
            data = [{"name": str(k), "value": int(v)} for k, v in value_counts.items()]
            return {"type": "categorical", "data": data}
