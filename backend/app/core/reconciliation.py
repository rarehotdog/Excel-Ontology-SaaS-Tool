import pandas as pd
from typing import List, Dict, Any

class Reconciler:
    def reconcile_datasets(self, df_internal: pd.DataFrame, df_external: pd.DataFrame, key_columns: List[str], value_columns: List[str]) -> Dict[str, Any]:
        """
        Reconciles two datasets based on key columns and compares value columns.
        """
        # Ensure keys are string for merging to avoid type mismatches
        for col in key_columns:
            df_internal[col] = df_internal[col].astype(str)
            df_external[col] = df_external[col].astype(str)

        # Merge datasets
        merged = pd.merge(
            df_internal, 
            df_external, 
            on=key_columns, 
            how='outer', 
            suffixes=('_int', '_ext'), 
            indicator=True
        )

        # 1. Missing in External (Present in Internal only)
        missing_in_external = merged[merged['_merge'] == 'left_only']
        
        # 2. Missing in Internal (Present in External only)
        missing_in_internal = merged[merged['_merge'] == 'right_only']

        # 3. Value Mismatches (Present in both but values differ)
        matched = merged[merged['_merge'] == 'both'].copy()
        mismatches = []
        
        for col in value_columns:
            col_int = f"{col}_int"
            col_ext = f"{col}_ext"
            
            # Check if columns exist (they should if passed in value_columns)
            if col_int in matched.columns and col_ext in matched.columns:
                # Calculate difference (assuming numeric)
                # Handle non-numeric gracefully or enforce type before
                try:
                    matched[f'{col}_diff'] = matched[col_int].astype(float) - matched[col_ext].astype(float)
                    # Filter where diff is not 0 (with some tolerance if needed)
                    diff_mask = matched[f'{col}_diff'].abs() > 0.01 
                    mismatch_rows = matched[diff_mask]
                    
                    for idx, row in mismatch_rows.iterrows():
                        mismatches.append({
                            "key": {k: row[k] for k in key_columns},
                            "column": col,
                            "internal_value": row[col_int],
                            "external_value": row[col_ext],
                            "diff": row[f'{col}_diff']
                        })
                except Exception:
                    # Fallback for non-numeric comparison
                    diff_mask = matched[col_int] != matched[col_ext]
                    mismatch_rows = matched[diff_mask]
                    for idx, row in mismatch_rows.iterrows():
                        mismatches.append({
                            "key": {k: row[k] for k in key_columns},
                            "column": col,
                            "internal_value": row[col_int],
                            "external_value": row[col_ext],
                            "diff": "N/A (String mismatch)"
                        })

        return {
            "summary": {
                "total_internal": len(df_internal),
                "total_external": len(df_external),
                "matched_count": len(matched),
                "missing_in_external_count": len(missing_in_external),
                "missing_in_internal_count": len(missing_in_internal),
                "value_mismatch_count": len(mismatches)
            },
            "missing_in_external": missing_in_external[key_columns].to_dict(orient='records'),
            "missing_in_internal": missing_in_internal[key_columns].to_dict(orient='records'),
            "mismatches": mismatches
        }
