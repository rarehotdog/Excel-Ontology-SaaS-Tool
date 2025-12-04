class LLMAgent:
    def __init__(self):
        pass

    def propose_analysis(self, metadata_list):
        """
        Propose analysis steps based on the data metadata.
        """
        # Mock implementation
        return [
            "데이터의 결측치와 이상치를 확인하여 정제합니다.",
            "주요 변수 간의 상관관계를 분석하여 시각화합니다.",
            "시계열 데이터를 기반으로 향후 추세를 예측합니다."
        ]

    def generate_insights(self, metadata_list):
        """
        Generate insights from the data.
        """
        # Mock implementation
        return [
            "매출 데이터에서 계절성이 관찰됩니다.",
            "특정 고객군에서 이탈률이 높게 나타납니다.",
            "마케팅 비용과 매출 간의 양의 상관관계가 있습니다."
        ]

    def generate_plan(self, prompt, metadata_list):
        """
        Generate a step-by-step plan for the user's request.
        """
        # Mock implementation
        return f"1. 데이터를 로드합니다.\n2. '{prompt}'에 대한 분석을 수행합니다.\n3. 결과를 시각화합니다."

    def generate_code(self, prompt, plan, metadata_list):
        """
        Generate Python code to execute the plan.
        """
        # Mock implementation - returns code that sets a result
        # We assume the user might ask for something simple for now
        return """
```python
# 예시 코드
import pandas as pd

# 데이터가 있다고 가정하고 첫 번째 파일의 행 수를 반환
if dfs:
    first_key = list(dfs.keys())[0]
    result = len(dfs[first_key])
else:
    result = "데이터가 없습니다."
```
"""

    def generate_summary(self, prompt, result):
        """
        Summarize the execution result in Korean.
        """
        return f"분석 결과, 값은 {result}입니다."
