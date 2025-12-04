import re
from typing import List, Dict, Any

class LLMAgent:
    def __init__(self):
        pass

    def propose_analysis(self, metadata_list):
        """
        Propose analysis steps based on the data metadata.
        """
        return [
            "데이터의 결측치와 이상치를 확인하여 정제합니다.",
            "주요 변수 간의 상관관계를 분석하여 시각화합니다.",
            "시계열 데이터를 기반으로 향후 추세를 예측합니다."
        ]

    def generate_insights(self, metadata_list):
        """
        Generate insights from the data.
        """
        return [
            "매출 데이터에서 계절성이 관찰됩니다.",
            "특정 고객군에서 이탈률이 높게 나타납니다.",
            "마케팅 비용과 매출 간의 양의 상관관계가 있습니다."
        ]

    def generate_plan(self, prompt, metadata_list):
        """
        Generate a step-by-step plan for the user's request.
        """
        # Simple heuristic plan generation
        steps = ["데이터를 로드합니다."]
        
        if "필터" in prompt or "filter" in prompt.lower() or "조건" in prompt:
            steps.append("조건에 맞는 데이터를 필터링합니다.")
        if "정렬" in prompt or "sort" in prompt.lower() or "순서" in prompt:
            steps.append("데이터를 정렬합니다.")
        if "그룹" in prompt or "group" in prompt.lower() or "집계" in prompt:
            steps.append("그룹별 집계를 수행합니다.")
        if "가장" in prompt or "최대" in prompt or "max" in prompt.lower():
            steps.append("최대값을 가진 항목을 찾습니다.")
        
        steps.append("결과를 반환합니다.")
        return "\n".join([f"{i+1}. {step}" for i, step in enumerate(steps)])

    def generate_code(self, prompt, plan, metadata_list):
        """
        Generate Python code to execute the plan using Regex patterns.
        """
        prompt_lower = prompt.lower()
        code_lines = ["import pandas as pd", ""]
        
        operations = []

        # 1. Max / Highest: "매출이 가장 높은 지역"
        # Regex: (Word) (Particle)? (Max Keyword)
        max_match = re.search(r"(\w+)\s*(이|가|은|는)?\s*(가장|제일|최대)", prompt)
        if max_match:
            col = max_match.group(1)
            operations.append(f"# Found max intent for column '{col}'")
            operations.append(f"if '{col}' in df.columns:")
            operations.append(f"    df = df.sort_values(by='{col}', ascending=False)")
            # If user asks for specific column output: "지역 말해줘"
            target_match = re.search(r"(\w+)\s*(을|를)?\s*(말해줘|보여줘|출력해|알려줘)", prompt)
            if target_match and target_match.group(1) != col:
                target_col = target_match.group(1)
                operations.append(f"    if '{target_col}' in df.columns:")
                operations.append(f"        result = df[['{target_col}', '{col}']].head(1)")
                operations.append(f"    else:")
                operations.append(f"        result = df.head(1)")
            else:
                operations.append(f"    result = df.head(1)")
            operations.append(f"else:")
            operations.append(f"    # Fallback: Sort by first numeric column if possible")
            operations.append(f"    numeric_cols = df.select_dtypes(include=['number']).columns")
            operations.append(f"    if len(numeric_cols) > 0:")
            operations.append(f"        df = df.sort_values(by=numeric_cols[0], ascending=False)")
            operations.append(f"        result = df.head(1)")
            operations.append(f"    else:")
            operations.append(f"        result = df.head()")
        
        # 2. Sorting: "Sort by Amount desc"
        elif "정렬" in prompt or "sort" in prompt_lower:
            sort_match = re.search(r"(sort|정렬).*(by|기준)?\s*(\w+)\s*(desc|asc|오름차순|내림차순)?", prompt_lower)
            if sort_match:
                col = sort_match.group(3)
                order = sort_match.group(4)
                ascending = False if order in ['desc', '내림차순'] else True
                operations.append(f"if '{col}' in df.columns:")
                operations.append(f"    df = df.sort_values(by='{col}', ascending={ascending})")
                operations.append(f"    result = df")

        # 3. Group By: "Group by Category sum Amount"
        elif "그룹" in prompt or "group" in prompt_lower:
            group_match = re.search(r"(group|그룹).*(by|기준)?\s*(\w+)", prompt_lower)
            if group_match:
                col = group_match.group(3)
                operations.append(f"if '{col}' in df.columns:")
                operations.append(f"    df = df.groupby('{col}').sum(numeric_only=True)")
                operations.append(f"    result = df")

        # 4. Select: "Select Date, Amount"
        elif "선택" in prompt or "select" in prompt_lower:
            select_match = re.search(r"(select|선택).*(columns|컬럼)?\s*(.+)", prompt_lower)
            if select_match:
                cols = select_match.group(3).replace("and", ",").split(",")
                cols_list = [c.strip() for c in cols]
                operations.append(f"cols = {cols_list}")
                operations.append(f"valid_cols = [c for c in cols if c in df.columns]")
                operations.append(f"if valid_cols:")
                operations.append(f"    df = df[valid_cols]")
                operations.append(f"    result = df")

        if not operations:
            # Default fallback
            operations.append("# Could not parse specific intent. Returning head.")
            operations.append("df = df.head()")
            operations.append("result = df")

        code_lines.extend(operations)
        
        return "```python\n" + "\n".join(code_lines) + "\n```"

    def generate_summary(self, prompt, result):
        """
        Summarize the execution result in Korean.
        """
        if isinstance(result, int):
            return f"분석 결과, 총 {result}건의 데이터가 있습니다."
        elif hasattr(result, 'shape'):
            return f"분석 결과, {result.shape[0]}행 {result.shape[1]}열의 데이터가 생성되었습니다."
        else:
            return "분석이 완료되었습니다."
