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

        NOTE: This is a lightweight heuristic implementation that looks at keywords
        in the natural language prompt and available columns in the schema to
        build a sensible plan. In a real product this would delegate to an LLM.
        """
        text = prompt.lower()
        fields = schema.get("fields") or []

        plan = {
            "tables": [],
            "layout": {"type": "REPORT", "sections": []},
        }

        # Helper: find column by (case-insensitive) name fragment
        def find_column(candidates):
            for col in fields:
                col_l = str(col).lower()
                if any(token in col_l for token in candidates):
                    return col
            return None

        # === Top N by amount / 금액 상위 N개 ===
        amount_col = find_column(["amount", "금액", "amt"])
        wants_top_n = any(
            kw in text
            for kw in [
                "top ",
                "상위",
                "가장 비싼",
                "비싼",
                "큰 순",
                "높은 순",
            ]
        )

        # Simple number extraction for "10개", "10 개", "top 10" 등
        limit_n = None
        for n in [5, 10, 20, 50]:
            if f"{n}개" in prompt or f"{n} 개" in prompt or f"top {n}" in text or f"상위 {n}" in prompt:
                limit_n = n
                break

        if amount_col and wants_top_n:
            ops = []
            # Select all known columns
            ops.append({"type": "SELECT", "fields": list(fields)})
            # Order by amount descending
            ops.append({"type": "ORDER_BY", "field": amount_col, "direction": "DESC"})
            # Optional LIMIT
            if limit_n:
                ops.append({"type": "LIMIT", "count": limit_n})

            plan["tables"].append(
                {
                    "id": "top_amount",
                    "title": f"Top {limit_n or ''} by {amount_col}".strip(),
                    "operations": ops,
                }
            )
            plan["layout"]["sections"].append(
                {"id": "sec_top_amount", "title": "Top Amount Rows", "content": ["top_amount"]}
            )

        # === Simple FILTER patterns (region / category / payment) ===
        region_col = find_column(["region", "지역"])
        category_col = find_column(["category", "카테고리"])
        payment_col = find_column(["payment", "결제"])

        # Region filters (서울/부산/대전/광주/대구 등)
        city_tokens = ["서울", "부산", "대전", "광주", "대구", "인천", "울산", "세종"]
        chosen_city = next((c for c in city_tokens if c in prompt), None)
        if region_col and chosen_city and not plan["tables"]:
            ops = [
                {"type": "FILTER", "field": region_col, "value": chosen_city},
                {"type": "SELECT", "fields": list(fields)},
            ]
            plan["tables"].append(
                {
                    "id": "filter_region",
                    "title": f"{chosen_city} 지역만 보기",
                    "operations": ops,
                }
            )
            plan["layout"]["sections"].append(
                {"id": "sec_filter_region", "title": "Filtered by Region", "content": ["filter_region"]}
            )

        # Category filters (e.g. 식품/의류/생활용품 등)
        category_tokens = ["식품", "의류", "생활용품", "디지털", "교통", "여가", "여행"]
        chosen_category = next((c for c in category_tokens if c in prompt), None)
        if category_col and chosen_category and not plan["tables"]:
            ops = [
                {"type": "FILTER", "field": category_col, "value": chosen_category},
                {"type": "SELECT", "fields": list(fields)},
            ]
            plan["tables"].append(
                {
                    "id": "filter_category",
                    "title": f"{chosen_category} 카테고리만 보기",
                    "operations": ops,
                }
            )
            plan["layout"]["sections"].append(
                {
                    "id": "sec_filter_category",
                    "title": "Filtered by Category",
                    "content": ["filter_category"],
                }
            )

        # Payment method filters (카드/현금/간편결제 등)
        payment_tokens = ["카드", "현금", "간편결제", "계좌이체"]
        chosen_payment = next((c for c in payment_tokens if c in prompt), None)
        if payment_col and chosen_payment and not plan["tables"]:
            ops = [
                {"type": "FILTER", "field": payment_col, "value": chosen_payment},
                {"type": "SELECT", "fields": list(fields)},
            ]
            plan["tables"].append(
                {
                    "id": "filter_payment",
                    "title": f"{chosen_payment} 결제만 보기",
                    "operations": ops,
                }
            )
            plan["layout"]["sections"].append(
                {
                    "id": "sec_filter_payment",
                    "title": "Filtered by Payment Method",
                    "content": ["filter_payment"],
                }
            )

        # === Summary table (grouped) ===
        if "합계표" in prompt or "summary" in text:
            group_key = find_column(["category", "region", "status"]) or (fields[0] if fields else None)
            amount_for_summary = amount_col or find_column(["amount"])
            ops = []
            if group_key and amount_for_summary:
                ops.append(
                    {
                        "type": "GROUP_BY",
                        "keys": [group_key],
                        "aggregations": [
                            {"field": amount_for_summary, "op": "SUM", "as": "Total Amount"}
                        ],
                    }
                )
                ops.append({"type": "ORDER_BY", "field": "Total Amount", "direction": "DESC"})

                plan["tables"].append(
                    {
                        "id": "summary_table",
                        "title": "Summary Table",
                        "operations": ops,
                    }
                )
                plan["layout"]["sections"].append(
                    {"id": "sec_summary", "title": "Summary", "content": ["summary_table"]}
                )

        # === Detail table ===
        if "상세" in prompt or "detail" in text:
            default_fields = [c for c in ["Date", "Merchant", "Amount", "Status"] if c in str(schema)]
            ops = [
                {
                    "type": "SELECT",
                    "fields": default_fields,
                },
                {"type": "ORDER_BY", "field": default_fields[0] if default_fields else "", "direction": "DESC"},
            ]
            plan["tables"].append(
                {
                    "id": "detail_table",
                    "title": "Detail Table",
                    "operations": ops,
                }
            )
            plan["layout"]["sections"].append(
                {"id": "sec_detail", "title": "Details", "content": ["detail_table"]}
            )

        # Default if no rules applied
        if not plan["tables"]:
            plan["tables"].append(
                {
                    "id": "default_table",
                    "title": "Transformed Data",
                    "operations": [
                        {"type": "SELECT", "fields": []},  # Select all
                    ],
                }
            )
            plan["layout"]["sections"].append(
                {"id": "sec_data", "title": "Data", "content": ["default_table"]}
            )

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

                elif op["type"] == "LIMIT":
                    # Take top N rows
                    try:
                        n = int(op.get("count", 0) or 0)
                    except (TypeError, ValueError):
                        n = 0
                    if n > 0:
                        temp_df = temp_df.head(n)

            results[table["id"]] = temp_df
            
        return results
