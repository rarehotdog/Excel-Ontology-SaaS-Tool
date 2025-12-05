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

    def validate_prompt(self, prompt: str) -> Dict[str, Any]:
        """
        Validates if the prompt is meaningful Korean/English natural language.
        Returns {'valid': True/False, 'reason': str}
        """
        text = prompt.strip()
        
        if len(text) < 2:
            return {"valid": False, "reason": "입력이 너무 짧습니다."}
        
        # 인식 가능한 키워드 목록
        valid_keywords = [
            # 동작 키워드
            "보여", "줘", "해줘", "알려", "보기", "정렬", "필터", "그룹", "집계",
            "합계", "평균", "최대", "최소", "상위", "하위", "제외", "포함",
            "분석", "변환", "계산", "추출", "검색", "조회", "찾아", "만들어",
            "삭제", "추가", "수정", "정리", "분류", "나눠", "합쳐",
            # 영어 키워드
            "show", "filter", "group", "sort", "top", "bottom", "sum", "avg",
            "max", "min", "count", "by", "only", "exclude", "include",
            # 데이터 관련
            "데이터", "컬럼", "행", "열", "값", "숫자", "금액", "날짜", "이름",
            "지역", "카테고리", "부서", "상태", "결제", "거래", "매출", "비용",
            # 조건 키워드
            "만", "만큼", "이상", "이하", "초과", "미만", "같은", "다른",
            "크", "작", "높", "낮", "많", "적", "전체", "모든", "각",
            # 특정 값 (도시 등)
            "서울", "부산", "대전", "광주", "대구", "인천", "울산", "세종",
            # 숫자 패턴
            "10", "20", "50", "100", "개", "건",
        ]
        
        # 프롬프트에서 유효한 키워드가 하나라도 있는지 확인
        found_keywords = []
        text_lower = text.lower()
        for kw in valid_keywords:
            if kw in text_lower:
                found_keywords.append(kw)
        
        if not found_keywords:
            # 한글 자음/모음만 있는지 체크 (의미 없는 입력)
            import re
            # 자음만 있거나 모음만 있는 패턴
            jamo_pattern = re.compile(r'^[ㄱ-ㅎㅏ-ㅣ\s]+$')
            if jamo_pattern.match(text):
                return {"valid": False, "reason": "의미 있는 문장을 입력해주세요. (예: '상위 10개만 보여줘', '서울 지역만 필터링해줘')"}
            
            # 반복되는 문자 패턴 체크
            repeated_pattern = re.compile(r'(.)\1{3,}')
            if repeated_pattern.search(text):
                return {"valid": False, "reason": "의미 있는 문장을 입력해주세요. (예: '부서별로 집계해줘', '최신순으로 정렬해줘')"}
            
            return {"valid": False, "reason": "이해할 수 없는 요청입니다. 데이터 변환에 대한 명확한 지시를 입력해주세요."}
        
        return {"valid": True, "reason": None}

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
            "isValidRequest": True,  # 유효한 요청인지 표시
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

        # === Summary table (grouped) / 그룹별 집계 ===
        wants_group = any(
            kw in text
            for kw in ["합계표", "summary", "그룹", "group", "집계", "aggregate"]
        )
        
        if wants_group and not plan["tables"]:
            # 그룹 키 추출: 프롬프트에서 명시된 컬럼 또는 기본 컬럼
            group_key = None
            
            # "카테고리별", "부서별", "지역별" 등 패턴 인식
            group_patterns = [
                ("카테고리", ["category", "카테고리"]),
                ("부서", ["dept", "부서", "department"]),
                ("지역", ["region", "지역"]),
                ("상태", ["status", "상태"]),
                ("날짜", ["date", "날짜"]),
                ("월", ["month", "월"]),
            ]
            
            for pattern_name, col_candidates in group_patterns:
                if pattern_name in prompt:
                    group_key = find_column(col_candidates)
                    if group_key:
                        break
            
            # 패턴이 없으면 기본 그룹 키 찾기
            if not group_key:
                group_key = find_column(["category", "카테고리", "dept", "부서", "region", "지역", "status", "상태"])
            
            if not group_key and fields:
                # 숫자가 아닌 첫 번째 컬럼을 그룹 키로 사용
                group_key = fields[0]
            
            amount_for_summary = amount_col or find_column(["amount", "금액", "price", "가격", "sum", "합계"])
            
            ops = []
            if group_key and amount_for_summary:
                ops.append(
                    {
                        "type": "GROUP_BY",
                        "keys": [group_key],
                        "aggregations": [
                            {"field": amount_for_summary, "op": "SUM", "as": "합계"}
                        ],
                    }
                )
                ops.append({"type": "ORDER_BY", "field": "합계", "direction": "DESC"})

                plan["tables"].append(
                    {
                        "id": "summary_table",
                        "title": f"{group_key}별 집계",
                        "operations": ops,
                    }
                )
                plan["layout"]["sections"].append(
                    {"id": "sec_summary", "title": "Summary", "content": ["summary_table"]}
                )
            elif group_key:
                # 숫자 컬럼이 없으면 count만 수행
                ops.append(
                    {
                        "type": "GROUP_BY",
                        "keys": [group_key],
                        "aggregations": [
                            {"field": group_key, "op": "COUNT", "as": "건수"}
                        ],
                    }
                )
                ops.append({"type": "ORDER_BY", "field": "건수", "direction": "DESC"})

                plan["tables"].append(
                    {
                        "id": "summary_table",
                        "title": f"{group_key}별 집계",
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
                            agg_op = agg["op"].lower()
                            agg_field = agg["field"]
                            
                            # COUNT는 특별 처리 (어떤 컬럼이든 상관없음)
                            if agg_op == "count":
                                # 첫 번째 컬럼을 사용하여 count
                                count_col = temp_df.columns[0]
                                aggs[count_col] = "count"
                                rename_map[count_col] = agg["as"]
                            elif agg_field in temp_df.columns:
                                aggs[agg_field] = agg_op  # sum, mean, etc.
                                rename_map[agg_field] = agg["as"]
                        
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
