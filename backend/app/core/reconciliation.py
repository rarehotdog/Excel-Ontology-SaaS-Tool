import pandas as pd
from typing import List, Dict, Any, Optional

class Reconciler:
    def reconcile_datasets(
        self, 
        df_internal: pd.DataFrame, 
        df_external: pd.DataFrame, 
        mapping: Dict[str, Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Reconciles two datasets with potentially different column names.
        mapping structure:
        {
            "keys": {"internal_col": "external_col", ...},
            "values": {"internal_col": "external_col", ...}
        }
        """
        # Create copies to avoid modifying originals
        df_int = df_internal.copy()
        df_ext = df_external.copy()

        # Normalize keys (strip whitespace, lowercase) - Optional but good for robustness
        # for int_key in mapping['keys'].keys():
        #     df_int[int_key] = df_int[int_key].astype(str).str.strip()
        
        # for ext_key in mapping['keys'].values():
        #     df_ext[ext_key] = df_ext[ext_key].astype(str).str.strip()

        # Rename external columns to match internal for merging
        # We will use internal column names as the 'standard' for the result
        ext_rename_map = {}
        for int_k, ext_k in mapping['keys'].items():
            ext_rename_map[ext_k] = int_k
            # Ensure keys are string for merging
            df_int[int_k] = df_int[int_k].astype(str)
            df_ext[ext_k] = df_ext[ext_k].astype(str)
            
        for int_v, ext_v in mapping['values'].items():
            ext_rename_map[ext_v] = int_v

        df_ext_renamed = df_ext.rename(columns=ext_rename_map)

        # Key columns (now same name in both)
        merge_keys = list(mapping['keys'].keys())
        
        # Value columns to compare
        compare_cols = list(mapping['values'].keys())

        # Merge datasets
        merged = pd.merge(
            df_int, 
            df_ext_renamed, 
            on=merge_keys, 
            how='outer', 
            suffixes=('_int', '_ext'), 
            indicator=True
        )

        # 1. Missing in External (Present in Internal only)
        missing_in_external = merged[merged['_merge'] == 'left_only']
        
        # 2. Missing in Internal (Present in External only)
        missing_in_internal = merged[merged['_merge'] == 'right_only']

        # 3. Value Mismatches
        matched = merged[merged['_merge'] == 'both'].copy()
        mismatches = []
        
        for col in compare_cols:
            col_int = f"{col}_int"
            # If the column didn't exist in one of them, it might be NaN, handled by float conversion usually
            # But if we renamed, it should be col_int and col_ext
            col_ext = f"{col}_ext"
            
            # Calculate difference
            try:
                # Try numeric comparison first
                matched[f'{col}_diff'] = matched[col_int].astype(float) - matched[col_ext].astype(float)
                diff_mask = matched[f'{col}_diff'].abs() > 0.01 
                mismatch_rows = matched[diff_mask]
                
                for idx, row in mismatch_rows.iterrows():
                    mismatches.append({
                        "key": {k: row[k] for k in merge_keys},
                        "column": col,
                        "internal_value": row[col_int],
                        "external_value": row[col_ext],
                        "diff": row[f'{col}_diff']
                    })
            except Exception:
                # Fallback for string comparison
                diff_mask = matched[col_int].astype(str) != matched[col_ext].astype(str)
                mismatch_rows = matched[diff_mask]
                for idx, row in mismatch_rows.iterrows():
                    mismatches.append({
                        "key": {k: row[k] for k in merge_keys},
                        "column": col,
                        "internal_value": row[col_int],
                        "external_value": row[col_ext],
                        "diff": "Mismatch"
                    })

        # Calculate Net Financial Impact
        net_financial_impact = 0.0
        for m in mismatches:
            if isinstance(m['diff'], (int, float)):
                net_financial_impact += m['diff']

        # Prepare results
        # For missing records, we want to show the original columns if possible
        # But since we renamed df_ext, the missing_in_internal will have internal-like column names
        # This is actually better for consistency in the UI table.

        return {
            "summary": {
                "total_internal": len(df_internal),
                "total_external": len(df_external),
                "matched_count": len(matched),
                "missing_in_external_count": len(missing_in_external),
                "missing_in_internal_count": len(missing_in_internal),
                "value_mismatch_count": len(mismatches),
                "net_financial_impact": round(net_financial_impact, 2)
            },
            "missing_in_external": missing_in_external[merge_keys + compare_cols].to_dict(orient='records') if not missing_in_external.empty else [],
            "missing_in_internal": missing_in_internal[merge_keys + compare_cols].to_dict(orient='records') if not missing_in_internal.empty else [],
            "mismatches": mismatches
        }
