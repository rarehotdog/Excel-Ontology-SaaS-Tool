import pandas as pd
from typing import List, Dict, Any

class AnomalyDetector:
    def detect_overlapping_times(self, df: pd.DataFrame, start_col: str, end_col: str, user_id_col: str) -> List[Dict[str, Any]]:
        """
        Detects overlapping time intervals for the same user.
        """
        anomalies = []
        
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

        if "overlapping_time" in rules_config:
            cfg = rules_config["overlapping_time"]
            overlaps = self.detect_overlapping_times(df, cfg['start_col'], cfg['end_col'], cfg['user_id_col'])
            results["details"].extend(overlaps)

        if "zero_distance" in rules_config:
            cfg = rules_config["zero_distance"]
            zeros = self.detect_zero_distance_paid(df, cfg['distance_col'], cfg['amount_col'])
            results["details"].extend(zeros)

        results["total_anomalies"] = len(results["details"])
        return results
