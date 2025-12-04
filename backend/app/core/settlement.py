import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional

class FranchiseSettlement:
    def check_integrity(self, admin_df: pd.DataFrame, call_df: Optional[pd.DataFrame], payment_df: Optional[pd.DataFrame], billing_df: Optional[pd.DataFrame]) -> Dict[str, Any]:
        """
        Workflow A: Franchise Settlement - Integrity Check
        """
        results = []
        
        # Mocking logic: We assume 'admin_df' is the master list of trips
        
        for _, row in admin_df.iterrows():
            status = "green"
            issues = []
            
            # 1. Timestamp Validation (Payment vs Call)
            # Mock column names
            call_time = row.get("call_time") or row.get("start_time")
            pay_time = row.get("payment_time") or row.get("end_time")
            
            if call_time and pay_time:
                try:
                    if pd.to_datetime(pay_time) < pd.to_datetime(call_time):
                        status = "red"
                        issues.append("Payment before Call")
                except:
                    pass

            # 2. Status Check (Empty Car vs Payment)
            trip_status = row.get("status", "")
            amount = row.get("amount", 0)
            if trip_status == "Empty Car" and amount > 0:
                status = "red"
                issues.append("Payment during Empty Car")

            # 3. Billing Reconciliation (Service Fee)
            # Compare calculated fee vs billing data
            # Mock: Assume 'service_fee' in admin vs 'fee' in billing
            if billing_df is not None:
                # In real app, we would join on ID. Here we just mock a check.
                # Let's say if amount is very high, we flag it for billing check
                if amount > 50000:
                     status = "yellow"
                     issues.append("High Amount - Check Billing")

            # 4. Duplicate Check (Mock)
            if status == "green" and np.random.random() < 0.05:
                status = "yellow"
                issues.append("Potential Duplicate")

            results.append({
                **row.to_dict(),
                "integrity_status": status,
                "issues": ", ".join(issues)
            })
            
        return {
            "summary": {
                "total": len(results),
                "green": len([r for r in results if r["integrity_status"] == "green"]),
                "yellow": len([r for r in results if r["integrity_status"] == "yellow"]),
                "red": len([r for r in results if r["integrity_status"] == "red"]),
            },
            "details": results
        }

class BizSettlement:
    def compare_with_reasoning(self, df_a: pd.DataFrame, df_b: pd.DataFrame, keys: List[str]) -> Dict[str, Any]:
        """
        Workflow B: Biz Team Settlement - Iterative Diff with Reasoning
        """
        valid_keys = [k for k in keys if k in df_a.columns and k in df_b.columns]
        if not valid_keys:
            # Fallback to index if no keys
            merged = pd.merge(df_a, df_b, left_index=True, right_index=True, how='outer', indicator=True, suffixes=('_A', '_B'))
        else:
            merged = pd.merge(df_a, df_b, on=valid_keys, how='outer', indicator=True, suffixes=('_A', '_B'))
        
        discrepancies = []
        
        for _, row in merged.iterrows():
            reason = ""
            diff_amount = 0
            
            if row['_merge'] == 'left_only':
                reason = "Missing in File B"
            elif row['_merge'] == 'right_only':
                reason = "Missing in File A"
            else:
                # Find amount columns dynamically
                cols_a = [c for c in df_a.columns if 'amount' in c.lower() or 'price' in c.lower() or 'sales' in c.lower()]
                cols_b = [c for c in df_b.columns if 'amount' in c.lower() or 'price' in c.lower() or 'sales' in c.lower()]
                
                if cols_a and cols_b:
                    val_a = row.get(f"{cols_a[0]}_A", row.get(cols_a[0], 0))
                    val_b = row.get(f"{cols_b[0]}_B", row.get(cols_b[0], 0))
                    
                    try:
                        diff = float(val_a) - float(val_b)
                        if abs(diff) > 1: # Tolerance
                            diff_amount = diff
                            if abs(diff) == float(val_a) * 0.1:
                                reason = "VAT Difference (10%)"
                            elif abs(diff) < 100:
                                reason = "Rounding Error"
                            else:
                                reason = "Amount Mismatch"
                    except:
                        pass
            
            if reason:
                discrepancies.append({
                    **row.to_dict(),
                    "reason": reason,
                    "diff_amount": diff_amount
                })
                
        return {
            "total_discrepancies": len(discrepancies),
            "discrepancies": discrepancies
        }

    def reaggregate_and_compare(self, df_a: pd.DataFrame, df_b: pd.DataFrame, keys: List[str], filters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Re-runs comparison after applying filters/transformations.
        """
        # Apply filters (Mock logic)
        filtered_a = df_a.copy()
        filtered_b = df_b.copy()
        
        # Example filter: "Exclude Date Range"
        if "exclude_date_start" in filters and "date" in filtered_a.columns:
             # Mock date filtering
             pass
             
        return self.compare_with_reasoning(filtered_a, filtered_b, keys)
