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

    def generate_insights(self, metadata_list, data_store=None):
        """
        Generate insights, trend data, KPI metrics, and chart metadata from actual data.
        """
        import pandas as pd
        
        insights = []
        trend_data = []
        kpi_metrics = []
        chart_metadata = {
            "time_series": None,
            "distribution": None
        }
        
        total_rows = 0
        total_columns = 0
        
        for meta in metadata_list:
            columns = [c.lower() for c in meta.get('columns', [])]
            original_columns = meta.get('columns', [])
            filename = meta.get('filename', 'Unknown')
            rows = meta.get('shape', [0, 0])[0]
            cols = meta.get('shape', [0, 0])[1]
            
            total_rows += rows
            total_columns += cols
            
            # Get actual dataframe if available
            df = data_store.get(filename) if data_store else None
            
            # Time-series detection & Trend Analysis
            date_col = next((c for c in columns if c in ['date', 'time', 'timestamp', 'year', 'month', 'day']), None)
            value_col = next((c for c in columns if c in ['price', 'amount', 'cost', 'revenue', 'sales', 'profit', 'value']), None)
            
            # Get original column names
            date_col_original = original_columns[columns.index(date_col)] if date_col and date_col in columns else None
            value_col_original = original_columns[columns.index(value_col)] if value_col and value_col in columns else None
            
            if date_col and value_col and df is not None:
                insights.append(f"'{filename}' 파일에서 시계열 데이터({date_col_original}, {value_col_original})가 감지되었습니다.")
                
                # Calculate actual trend from data with intelligent grouping
                try:
                    # Convert date column to datetime
                    df_copy = df.copy()
                    df_copy[date_col_original] = pd.to_datetime(df_copy[date_col_original], errors='coerce')
                    df_copy = df_copy.dropna(subset=[date_col_original, value_col_original])
                    
                    if len(df_copy) > 0:
                        # Determine appropriate time grouping based on data range
                        date_range = (df_copy[date_col_original].max() - df_copy[date_col_original].min()).days
                        
                        if date_range <= 7:
                            # Daily grouping for week or less
                            df_copy['period'] = df_copy[date_col_original].dt.strftime('%Y-%m-%d')
                            period_label = "일별"
                        elif date_range <= 60:
                            # Daily grouping for 2 months or less
                            df_copy['period'] = df_copy[date_col_original].dt.strftime('%m/%d')
                            period_label = "일별"
                        elif date_range <= 365:
                            # Weekly grouping for a year or less
                            df_copy['period'] = df_copy[date_col_original].dt.to_period('W').astype(str)
                            period_label = "주별"
                        elif date_range <= 1095:  # 3 years
                            # Monthly grouping
                            df_copy['period'] = df_copy[date_col_original].dt.to_period('M').astype(str)
                            period_label = "월별"
                        else:
                            # Yearly grouping for longer periods
                            df_copy['period'] = df_copy[date_col_original].dt.to_period('Y').astype(str)
                            period_label = "연도별"
                        
                        # Group and calculate statistics
                        grouped = df_copy.groupby('period')[value_col_original].agg(['mean', 'min', 'max', 'count']).reset_index()
                        
                        # Convert to trend_data format
                        trend_data = []
                        for _, row in grouped.iterrows():
                            trend_data.append({
                                "name": row['period'],
                                "value": float(row['mean'])
                            })
                        
                        # Calculate detailed statistics
                        if len(grouped) > 1:
                            first_val = grouped['mean'].iloc[0]
                            last_val = grouped['mean'].iloc[-1]
                            pct_change = ((last_val - first_val) / first_val) * 100 if first_val != 0 else 0
                            
                            # Overall statistics
                            overall_mean = df_copy[value_col_original].mean()
                            overall_std = df_copy[value_col_original].std()
                            overall_min = df_copy[value_col_original].min()
                            overall_max = df_copy[value_col_original].max()
                            
                            # Trend analysis
                            trend_direction = "증가" if pct_change > 0 else "감소"
                            trend_strength = "급격한" if abs(pct_change) > 50 else "완만한" if abs(pct_change) > 10 else "미미한"
                            
                            insights.append(
                                f"분석 기간 동안 {value_col_original}이(가) {trend_strength} {trend_direction} 추세를 보입니다 "
                                f"(변화율: {pct_change:+.1f}%). "
                                f"평균값은 {overall_mean:.2f}이며, 최소 {overall_min:.2f}에서 최대 {overall_max:.2f}까지 변동했습니다."
                            )
                            
                            # Volatility analysis
                            cv = (overall_std / overall_mean * 100) if overall_mean != 0 else 0
                            if cv > 30:
                                insights.append(f"{value_col_original}의 변동성이 높습니다 (변동계수: {cv:.1f}%). 안정성 개선이 필요할 수 있습니다.")
                            elif cv < 10:
                                insights.append(f"{value_col_original}이(가) 안정적인 패턴을 보입니다 (변동계수: {cv:.1f}%).")
                            
                            # Peak detection
                            max_period = grouped.loc[grouped['mean'].idxmax(), 'period']
                            min_period = grouped.loc[grouped['mean'].idxmin(), 'period']
                            insights.append(f"최고점은 {max_period} ({grouped['mean'].max():.2f}), 최저점은 {min_period} ({grouped['mean'].min():.2f})에 기록되었습니다.")
                    
                except Exception as e:
                    # Fallback to simple grouping
                    import random
                    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                    base_val = 1000
                    trend_data = []
                    for m in months:
                        val = base_val + random.randint(-200, 300)
                        trend_data.append({"name": m, "value": val})
                        base_val = val
                    insights.append(f"시계열 데이터 처리 중 오류가 발생하여 샘플 데이터를 표시합니다: {str(e)}")
                    period_label = "월별"
                
                # Store metadata for chart description
                chart_metadata["time_series"] = {
                    "date_column": date_col_original,
                    "value_column": value_col_original,
                    "filename": filename,
                    "period_label": period_label if 'period_label' in locals() else "월별",
                    "reason": f"'{filename}' 파일에 시간 정보({date_col_original})와 수치 데이터({value_col_original})가 포함되어 있어 {period_label if 'period_label' in locals() else '월별'} 시계열 분석을 수행했습니다."
                }

            elif date_col:
                 insights.append(f"'{filename}' 파일에서 날짜 정보({date_col_original})가 확인되었습니다. 시계열 분석이 가능합니다.")

            # Financial detection
            if any(x in columns for x in ['price', 'amount', 'cost', 'revenue', 'sales', 'profit']):
                 if not (date_col and value_col):
                    insights.append(f"'{filename}' 파일에서 재무 데이터가 감지되었습니다. 비용 최적화 기회가 있을 수 있습니다.")
                
            # ID/Key detection
            if any(x in columns for x in ['id', 'key', 'code', 'number']):
                insights.append(f"'{filename}' 파일에서 고유 식별자가 감지되었습니다. 데이터 병합에 활용하세요.")
                
            # Categorical detection and distribution
            category_col = next((c for c in columns if c in ['category', 'type', 'status', 'group', 'class']), None)
            category_col_original = original_columns[columns.index(category_col)] if category_col and category_col in columns else None
            
            if category_col and df is not None:
                insights.append(f"'{filename}' 파일에서 범주형 데이터({category_col_original})가 감지되었습니다.")
                
                # Calculate actual distribution
                try:
                    distribution = df[category_col_original].value_counts().head(10).to_dict()
                    distribution_data = [{"name": str(k), "value": int(v)} for k, v in distribution.items()]
                    
                    total_categories = len(df[category_col_original].unique())
                    total_records = len(df)
                    
                    # Detailed distribution analysis
                    top_category = list(distribution.keys())[0] if distribution else None
                    top_category_pct = (distribution[top_category] / total_records * 100) if top_category else 0
                    
                    # Balance analysis
                    if top_category_pct > 70:
                        insights.append(
                            f"{category_col_original}의 분포가 불균형합니다. "
                            f"'{top_category}' 카테고리가 전체의 {top_category_pct:.1f}%를 차지하고 있어 "
                            f"데이터 편향이 발생할 수 있습니다. 다른 카테고리의 데이터 수집을 고려하세요."
                        )
                    elif top_category_pct < 30 and total_categories > 5:
                        insights.append(
                            f"{category_col_original}의 분포가 균등합니다. "
                            f"총 {total_categories}개 카테고리가 비교적 고르게 분포되어 있어 "
                            f"다양한 패턴 분석이 가능합니다."
                        )
                    
                    # Provide top categories info
                    top_3 = list(distribution.items())[:3]
                    top_3_str = ", ".join([f"'{k}' ({v}건, {v/total_records*100:.1f}%)" for k, v in top_3])
                    insights.append(f"상위 3개 카테고리: {top_3_str}")
                    
                    chart_metadata["distribution"] = {
                        "category_column": category_col_original,
                        "filename": filename,
                        "reason": f"'{filename}' 파일에 범주형 데이터({category_col_original})가 포함되어 있어 각 카테고리별 분포를 파악하기 위해 분포 분석을 수행했습니다.",
                        "data": distribution_data,
                        "total_categories": total_categories
                    }
                except Exception as e:
                    chart_metadata["distribution"] = {
                        "category_column": category_col_original,
                        "filename": filename,
                        "reason": f"범주형 데이터 처리 중 오류 발생: {str(e)}",
                        "data": [],
                        "total_categories": 0
                    }
        
        # Generate KPI metrics if we have meaningful data
        if total_rows > 0:
            kpi_metrics.append({
                "label": "Total Records",
                "value": f"{total_rows:,}",
                "color": "emerald",
                "icon": "database"
            })
        
        if total_columns > 0:
            kpi_metrics.append({
                "label": "Total Columns",
                "value": str(total_columns),
                "color": "blue",
                "icon": "columns"
            })
        
        if len(metadata_list) > 0:
            kpi_metrics.append({
                "label": "Files Analyzed",
                "value": str(len(metadata_list)),
                "color": "purple",
                "icon": "files"
            })
        
        if not insights:
            insights.append("데이터 구조를 분석했습니다. 더 구체적인 분석을 위해 'Smart Transform'을 사용하여 데이터를 정제해보세요.")
            
        return {
            "insights": insights, 
            "trend_data": trend_data, 
            "kpi_metrics": kpi_metrics,
            "chart_metadata": chart_metadata
        }

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
        # This is a simplified code generation
        # In a real system, you'd use an LLM or more sophisticated logic
        code_lines = ["import pandas as pd", ""]
        
        # Load data
        if metadata_list:
            first_file = metadata_list[0].get('filename', 'data.csv')
            code_lines.append(f"df = pd.read_csv('{first_file}')")
        
        # Filter
        if "필터" in prompt or "filter" in prompt.lower():
            code_lines.append("# 필터링 조건을 추가하세요")
            code_lines.append("# df = df[df['column'] > value]")
        
        # Sort
        if "정렬" in prompt or "sort" in prompt.lower():
            code_lines.append("# 정렬")
            code_lines.append("# df = df.sort_values('column')")
        
        # Group
        if "그룹" in prompt or "group" in prompt.lower():
            code_lines.append("# 그룹별 집계")
            code_lines.append("# result = df.groupby('column').sum()")
        
        code_lines.append("")
        code_lines.append("# 결과 출력")
        code_lines.append("print(df.head())")
        
        return "\n".join(code_lines)
