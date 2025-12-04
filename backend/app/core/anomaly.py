import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple

class AnomalyDetector:
    def _column_exists(self, df: pd.DataFrame, col: str) -> bool:
        """Safely check if a column exists in the dataframe."""
        return col in df.columns

    def _infer_time_and_user_columns(self, df: pd.DataFrame) -> Optional[Tuple[str, str, str]]:
        """
        Try to infer start/end time and user id columns from arbitrary schemas.
        This makes anomaly detection work on real-world data without strict naming.
        """
        cols = list(df.columns)
        lower_map = {c.lower(): c for c in cols}

        def find_col(candidates):
            for key, original in lower_map.items():
                if any(token in key for token in candidates):
                    return original
            return None

        # Heuristics for time columns
        start_col = find_col(["start_time", "start time", "start", "begin", "from"])
        end_col = find_col(["end_time", "end time", "end", "finish", "to"])

        # Heuristics for user/driver/id columns
        user_id_col = find_col(["user_id", "userid", "user", "driver_id", "driver", "id"])

        if start_col and end_col and user_id_col:
            return start_col, end_col, user_id_col

        return None

    def _infer_distance_amount_columns(self, df: pd.DataFrame) -> Optional[Tuple[str, str]]:
        """
        Try to infer distance and amount/price columns from arbitrary schemas.
        """
        cols = list(df.columns)
        lower_map = {c.lower(): c for c in cols}

        def find_col(candidates):
            for key, original in lower_map.items():
                if any(token in key for token in candidates):
                    return original
            return None

        distance_col = find_col(["distance", "dist", "km", "kilometer", "mile"])
        amount_col = find_col(["amount", "fare", "price", "payment", "pay", "cost", "fee"])

        if distance_col and amount_col:
            return distance_col, amount_col

        return None

    def infer_rules(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Infer reasonable default anomaly rules based on the dataframe's columns.

        This allows the frontend to simply send a filename without hard‑coding
        specific column names like start_time/end_time, making the system
        resilient to different schemas.
        """
        rules: Dict[str, Any] = {}

        # Always run statistical outlier detection on numeric columns
        rules["statistical_outliers"] = True

        time_user = self._infer_time_and_user_columns(df)
        if time_user:
            start_col, end_col, user_id_col = time_user
            rules["overlapping_time"] = {
                "start_col": start_col,
                "end_col": end_col,
                "user_id_col": user_id_col,
            }

        distance_amount = self._infer_distance_amount_columns(df)
        if distance_amount:
            distance_col, amount_col = distance_amount
            rules["zero_distance"] = {
                "distance_col": distance_col,
                "amount_col": amount_col,
            }

        return rules

    def detect_statistical_outliers(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Detects statistical outliers in numeric columns using IQR method.
        This provides generic anomaly detection for any dataset.
        """
        anomalies = []
        numeric_cols = df.select_dtypes(include=[np.number]).columns

        for col in numeric_cols:
            # Skip ID-like columns (simple heuristic)
            if 'id' in col.lower() or 'key' in col.lower() or df[col].nunique() == len(df):
                continue

            # Calculate IQR
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            # Define bounds (using 3.0 for extreme outliers to reduce noise, or 1.5 for standard)
            lower_bound = Q1 - 3.0 * IQR
            upper_bound = Q3 + 3.0 * IQR

            outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
            
            if not outliers.empty:
                # Limit to top 5 extreme outliers per column to avoid flooding
                top_outliers = outliers.head(5)
                for idx, row in top_outliers.iterrows():
                    val = row[col]
                    anomalies.append({
                        "type": "Statistical Outlier",
                        "column": col,
                        "row_index": int(idx),
                        "details": f"Value {val} in column '{col}' is a statistical outlier (Range: {lower_bound:.2f} ~ {upper_bound:.2f})"
                    })

        return anomalies

    def detect_overlapping_times(self, df: pd.DataFrame, start_col: str, end_col: str, user_id_col: str) -> List[Dict[str, Any]]:
        """
        Detects overlapping time intervals for the same user.
        """
        anomalies = []

        # Validate required columns
        missing_cols = [c for c in [start_col, end_col, user_id_col] if c not in df.columns]
        if missing_cols:
            return [{
                "type": "Rule Error",
                "details": f"Required columns for overlapping_time rule not found: {', '.join(missing_cols)}"
            }]
        
        # Ensure datetime type
        try:
            df[start_col] = pd.to_datetime(df[start_col])
            df[end_col] = pd.to_datetime(df[end_col])
        except Exception as e:
            return [{"error": f"Date parsing failed: {str(e)}"}]

        # Sort by user and start time
        df_sorted = df.sort_values(by=[user_id_col, start_col])

        # Group by user and check overlaps
        for user_id, group in df_sorted.groupby(user_id_col):
            group = group.reset_index()
            for i in range(len(group) - 1):
                current_row = group.iloc[i]
                next_row = group.iloc[i+1]

                # Check if current end time is greater than next start time
                if current_row[end_col] > next_row[start_col]:
                    anomalies.append({
                        "type": "Overlapping Time",
                        "user_id": str(user_id),
                        "row_a": int(current_row['index']), # Original index
                        "row_b": int(next_row['index']),
                        "details": f"Ride {current_row['index']} overlaps with {next_row['index']}"
                    })
        
        return anomalies

    def detect_zero_distance_paid(self, df: pd.DataFrame, distance_col: str, amount_col: str) -> List[Dict[str, Any]]:
        """
        Detects rides where distance is 0 (or near 0) but amount is > 0.
        """
        anomalies = []

        # Validate required columns
        missing_cols = [c for c in [distance_col, amount_col] if c not in df.columns]
        if missing_cols:
            return [{
                "type": "Rule Error",
                "details": f"Required columns for zero_distance rule not found: {', '.join(missing_cols)}"
            }]
        
        # Filter conditions
        mask = (df[distance_col] <= 0) & (df[amount_col] > 0)
        suspicious_rows = df[mask]

        for idx, row in suspicious_rows.iterrows():
            anomalies.append({
                "type": "Zero Distance Payment",
                "row_index": int(idx),
                "details": f"Distance is {row[distance_col]} but Amount is {row[amount_col]}"
            })
            
        return anomalies

    def check_rules(self, df: pd.DataFrame, rules_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Orchestrator to run configured rules.
        """
        results = {
            "total_anomalies": 0,
            "details": []
        }

        # If no rules are provided, simply return empty results
        if not rules_config:
            return results

        # Statistical Outliers (General)
        if rules_config.get("statistical_outliers"):
            stats_anomalies = self.detect_statistical_outliers(df)
            results["details"].extend(stats_anomalies)

        # Overlapping time rule
        if "overlapping_time" in rules_config:
            cfg = rules_config["overlapping_time"]
            start_col = cfg.get("start_col")
            end_col = cfg.get("end_col")
            user_id_col = cfg.get("user_id_col")

            if not all([start_col, end_col, user_id_col]):
                results["details"].append({
                    "type": "Rule Error",
                    "details": "overlapping_time rule is missing required column mappings."
                })
            else:
                overlaps = self.detect_overlapping_times(df, start_col, end_col, user_id_col)
                results["details"].extend(overlaps)

        # Zero distance rule
        if "zero_distance" in rules_config:
            cfg = rules_config["zero_distance"]
            distance_col = cfg.get("distance_col")
            amount_col = cfg.get("amount_col")

            if not all([distance_col, amount_col]):
                results["details"].append({
                    "type": "Rule Error",
                    "details": "zero_distance rule is missing required column mappings."
                })
            else:
                zeros = self.detect_zero_distance_paid(df, distance_col, amount_col)
                results["details"].extend(zeros)

        results["total_anomalies"] = len(results["details"])
        return results
