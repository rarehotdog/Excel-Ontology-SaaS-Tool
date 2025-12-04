from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np

from app.services import processor, smart_transformer

# Prefix and tags are applied in app.main when including this router.
router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str


class ExecuteRequest(BaseModel):
    """
    Execute a smart transform against an already-uploaded file.
    """
    prompt: str
    filename: str


class SuggestTemplatesRequest(BaseModel):
    """
    Request to suggest templates based on file schema.
    """
    filename: str


class AutoInsightRequest(BaseModel):
    """
    Request for automatic data insight analysis.
    """
    filename: str


class SmartFormatRequest(BaseModel):
    """
    Request for smart data formatting based on reference file.
    """
    filename: str
    reference_filename: Optional[str] = None  # 레퍼런스 파일 (선택)

@router.post("/auto-insight")
async def auto_insight(request: AutoInsightRequest):
    """
    Automatically analyze data and generate insights with transformed results.
    """
    if request.filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[request.filename]
    columns = list(df.columns)
    
    insights = []
    transformed_data = []
    output_name = f"insight_{request.filename}"
    
    # 1. 기본 통계 분석
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if numeric_cols:
        stats_data = []
        for col in numeric_cols:
            col_stats = {
                "컬럼명": col,
                "합계": f"{df[col].sum():,.0f}" if pd.notna(df[col].sum()) else "-",
                "평균": f"{df[col].mean():,.2f}" if pd.notna(df[col].mean()) else "-",
                "최대값": f"{df[col].max():,.0f}" if pd.notna(df[col].max()) else "-",
                "최소값": f"{df[col].min():,.0f}" if pd.notna(df[col].min()) else "-",
                "데이터수": int(df[col].count()),
            }
            stats_data.append(col_stats)
            insights.append(f"{col}: 합계 {col_stats['합계']}, 평균 {col_stats['평균']}")
        
        transformed_data = stats_data
    
    # 2. 카테고리별 분석 (그룹화 가능한 컬럼이 있으면)
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if categorical_cols and numeric_cols:
        # 첫 번째 카테고리 컬럼과 첫 번째 숫자 컬럼으로 그룹 분석
        cat_col = categorical_cols[0]
        num_col = numeric_cols[0]
        
        group_stats = df.groupby(cat_col)[num_col].agg(['sum', 'mean', 'count']).reset_index()
        group_stats.columns = [cat_col, '합계', '평균', '건수']
        group_stats = group_stats.sort_values('합계', ascending=False)
        
        # 상위 항목 인사이트
        if len(group_stats) > 0:
            top_item = group_stats.iloc[0]
            insights.append(f"가장 높은 {cat_col}: {top_item[cat_col]} (합계: {top_item['합계']:,.0f})")
        
        # 그룹 분석 결과를 변환 데이터로 사용
        group_stats['합계'] = group_stats['합계'].apply(lambda x: f"{x:,.0f}" if pd.notna(x) else "-")
        group_stats['평균'] = group_stats['평균'].apply(lambda x: f"{x:,.2f}" if pd.notna(x) else "-")
        transformed_data = group_stats.to_dict(orient='records')
    
    # 3. 데이터 품질 인사이트
    null_counts = df.isnull().sum()
    cols_with_nulls = null_counts[null_counts > 0]
    if len(cols_with_nulls) > 0:
        for col, count in cols_with_nulls.items():
            insights.append(f"⚠️ {col}: {count}개 빈 값 발견")
    
    # 결과가 없으면 기본 요약 제공
    if not transformed_data:
        summary = {
            "총 행 수": len(df),
            "총 컬럼 수": len(columns),
            "숫자 컬럼": len(numeric_cols),
            "텍스트 컬럼": len(categorical_cols),
        }
        transformed_data = [summary]
        insights.append(f"데이터셋: {len(df)}행 x {len(columns)}컬럼")
    
    # 변환 결과 저장
    result_df = pd.DataFrame(transformed_data)
    processor.data_store[output_name] = result_df
    
    return {
        "success": True,
        "outputFilename": output_name,
        "previewData": transformed_data,
        "insights": insights,
        "plan": {"tables": [{"id": "insight", "title": "Auto Insight Analysis"}]},
    }


@router.post("/smart-format")
async def smart_format(request: SmartFormatRequest):
    """
    Transform data based on a reference file structure.
    Maps columns from source to reference format and applies similar formatting.
    """
    if request.filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="Source file not found")
    
    if not request.reference_filename:
        raise HTTPException(status_code=400, detail="Reference filename is required")
    
    if request.reference_filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="Reference file not found")
    
    source_df = processor.data_store[request.filename].copy()
    reference_df = processor.data_store[request.reference_filename]
    
    output_name = f"formatted_{request.filename}"
    mapping_info = []
    
    # 레퍼런스 컬럼 분석
    ref_columns = list(reference_df.columns)
    source_columns = list(source_df.columns)
    
    # 컬럼 매핑 (유사도 기반)
    def find_best_match(ref_col, source_cols):
        ref_col_lower = str(ref_col).lower()
        
        # 1. 정확히 일치
        for src_col in source_cols:
            if str(src_col).lower() == ref_col_lower:
                return src_col, "exact"
        
        # 2. 부분 일치
        for src_col in source_cols:
            src_lower = str(src_col).lower()
            if ref_col_lower in src_lower or src_lower in ref_col_lower:
                return src_col, "partial"
        
        # 3. 키워드 기반 매핑
        keyword_groups = [
            (["date", "날짜", "일자", "일시"], ["date", "날짜", "일자", "일시", "timestamp"]),
            (["amount", "금액", "amt", "price", "가격"], ["amount", "금액", "amt", "price", "가격", "total", "합계"]),
            (["name", "이름", "명"], ["name", "이름", "명", "상호"]),
            (["category", "카테고리", "분류"], ["category", "카테고리", "분류", "type", "유형"]),
            (["region", "지역", "city", "도시"], ["region", "지역", "city", "도시", "area"]),
            (["status", "상태"], ["status", "상태"]),
            (["count", "수량", "건수"], ["count", "수량", "건수", "qty"]),
        ]
        
        for ref_keywords, src_keywords in keyword_groups:
            ref_match = any(kw in ref_col_lower for kw in ref_keywords)
            if ref_match:
                for src_col in source_cols:
                    src_lower = str(src_col).lower()
                    if any(kw in src_lower for kw in src_keywords):
                        return src_col, "keyword"
        
        return None, None
    
    # 새 DataFrame 생성 (레퍼런스 구조)
    result_df = pd.DataFrame()
    used_source_cols = set()
    matched_count = 0
    
    for ref_col in ref_columns:
        matched_col, match_type = find_best_match(ref_col, [c for c in source_columns if c not in used_source_cols])
        
        if matched_col:
            result_df[ref_col] = source_df[matched_col].copy()
            used_source_cols.add(matched_col)
            mapping_info.append({
                "reference": ref_col,
                "source": matched_col,
                "matchType": match_type
            })
            matched_count += 1
        else:
            # 매칭 실패 시 빈 컬럼
            result_df[ref_col] = None
            mapping_info.append({
                "reference": ref_col,
                "source": None,
                "matchType": "none"
            })
    
    # 매핑 성공률 계산
    match_ratio = matched_count / len(ref_columns) if ref_columns else 0
    
    # 매핑 성공률이 30% 미만이면 관련 없는 파일로 판단
    if match_ratio < 0.3:
        raise HTTPException(
            status_code=400, 
            detail=f"레퍼런스 파일과 원본 파일의 구조가 너무 다릅니다. (매칭률: {match_ratio*100:.0f}%) 유사한 구조의 파일을 선택해주세요."
        )
    
    # 레퍼런스 데이터 타입 및 형식 적용
    for ref_col in ref_columns:
        if ref_col not in result_df.columns:
            continue
            
        ref_dtype = reference_df[ref_col].dtype
        
        # 날짜 형식 적용
        if pd.api.types.is_datetime64_any_dtype(reference_df[ref_col]):
            try:
                result_df[ref_col] = pd.to_datetime(result_df[ref_col], errors='coerce')
            except:
                pass
        
        # 숫자 형식 적용
        elif pd.api.types.is_numeric_dtype(reference_df[ref_col]):
            try:
                result_df[ref_col] = pd.to_numeric(result_df[ref_col], errors='coerce')
            except:
                pass
    
    # 결과 저장
    processor.data_store[output_name] = result_df
    
    # 미리보기 데이터 생성
    preview_df = result_df.head(50).copy()
    
    # 날짜 및 금액 표시 포맷팅
    for col in preview_df.columns:
        col_l = str(col).lower()
        
        # 날짜 포맷팅
        if pd.api.types.is_datetime64_any_dtype(preview_df[col]):
            preview_df[col] = preview_df[col].dt.strftime('%Y-%m-%d')
        
        # 금액 포맷팅
        if any(kw in col_l for kw in ["amount", "금액", "price", "가격", "amt", "total", "합계"]):
            if pd.api.types.is_numeric_dtype(preview_df[col]):
                preview_df[col] = preview_df[col].apply(lambda x: f"{int(x):,}" if pd.notna(x) else "-")
    
    safe_preview = preview_df.replace({np.nan: None, pd.NaT: None})
    preview_data = safe_preview.to_dict(orient="records")
    
    return {
        "success": True,
        "outputFilename": output_name,
        "previewData": preview_data,
        "mappingInfo": mapping_info,
        "referenceColumns": ref_columns,
        "sourceColumns": source_columns,
        "plan": {"tables": [{"id": "formatted", "title": "Smart Format (Reference-based)"}]},
    }


@router.post("/suggest-templates")
async def suggest_templates(request: SuggestTemplatesRequest):
    """
    Analyze the uploaded file and suggest appropriate transformation templates.
    """
    if request.filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")
    
    df = processor.data_store[request.filename]
    columns = list(df.columns)
    
    templates = []
    
    # Helper functions
    def has_column(keywords):
        for col in columns:
            col_l = str(col).lower()
            if any(kw in col_l for kw in keywords):
                return col
        return None
    
    def is_numeric_column(col_name):
        if col_name in df.columns:
            return pd.api.types.is_numeric_dtype(df[col_name])
        return False
    
    # 1. 금액/숫자 컬럼이 있으면 상위 N개 템플릿
    amount_col = has_column(["amount", "금액", "price", "가격", "amt", "합계", "total"])
    if amount_col and is_numeric_column(amount_col):
        templates.append({
            "id": "top_10",
            "label": "상위 10개 조회",
            "prompt": f"{amount_col} 상위 10개만 보여줘",
            "description": f"{amount_col} 기준 상위 데이터"
        })
    
    # 2. 그룹화 가능한 컬럼이 있으면 그룹별 집계 템플릿
    group_col = has_column(["category", "카테고리", "dept", "부서", "region", "지역", "type", "유형", "분류"])
    if group_col and amount_col:
        templates.append({
            "id": "group_sum",
            "label": f"{group_col}별 집계",
            "prompt": f"{group_col}별로 그룹화하고 합계를 계산해줘",
            "description": f"{group_col}별 {amount_col} 합계"
        })
    elif group_col:
        templates.append({
            "id": "group_count",
            "label": f"{group_col}별 건수",
            "prompt": f"{group_col}별로 그룹화해서 건수를 계산해줘",
            "description": f"{group_col}별 데이터 건수"
        })
    
    # 3. 지역 컬럼이 있으면 지역 필터 템플릿
    region_col = has_column(["region", "지역", "city", "도시", "area"])
    if region_col:
        # 샘플 데이터에서 지역 값 추출
        sample_values = df[region_col].dropna().unique()[:3]
        if len(sample_values) > 0:
            sample_region = str(sample_values[0])
            templates.append({
                "id": "filter_region",
                "label": f"{sample_region} 지역만 필터링",
                "prompt": f"{sample_region} 지역만 필터링해줘",
                "description": f"{region_col} = {sample_region}"
            })
    
    # 4. 날짜 컬럼이 있으면 날짜 관련 템플릿
    date_col = has_column(["date", "날짜", "일자", "일시", "timestamp"])
    if date_col:
        templates.append({
            "id": "sort_date",
            "label": "최신순 정렬",
            "prompt": f"{date_col} 기준 최신순으로 정렬해줘",
            "description": f"{date_col} 내림차순 정렬"
        })
    
    # 5. 기본 합계표 템플릿 (항상 추가)
    if amount_col:
        templates.append({
            "id": "summary",
            "label": "합계표 생성",
            "prompt": "합계표로 정리해줘",
            "description": "전체 데이터 요약"
        })
    
    # 최대 4개까지만 반환
    return {"templates": templates[:4]}


@router.post("/generate")
async def generate_pipeline(request: GenerateRequest):
    """
    Generates a pipeline plan and mock preview data based on the user's natural language prompt.
    """
    # 1. Generate a plan using the SmartTransformer (currently uses mock logic based on keywords)
    # In a real scenario, this would pass the actual file schema.
    mock_schema = {"fields": ["Date", "Dept", "Amount", "Status", "Region", "Category"]}
    plan = smart_transformer.generate_plan_from_prompt(request.prompt, mock_schema)
    
    # 2. Convert the plan into frontend-compatible Node and Edge structures
    nodes = []
    edges = []
    
    # Fixed Input Node
    nodes.append({
        "id": "source-1", 
        "type": "source", 
        "label": "Data Source", 
        "x": 100, 
        "y": 180, 
        "data": {"icon": "Database"}
    })
    
    last_node_id = "source-1"
    x_pos = 320
    
    # Generate Transform Nodes from the plan's tables
    # We assume a linear flow for simplicity in this mock
    for idx, table in enumerate(plan.get("tables", [])):
        # Skip default table if we have specific ones, or handle logic as needed
        if table["id"] == "default_table" and len(plan["tables"]) > 1:
            continue
            
        node_id = f"transform-{idx}"
        
        # Determine icon based on operation type
        icon = "Filter"
        ops = table.get("operations", [])
        if ops:
            first_op = ops[0]["type"]
            if first_op == "GROUP_BY":
                icon = "GitMerge"
            elif first_op == "ORDER_BY":
                icon = "ListOrdered" # Or similar
            elif first_op == "CALCULATE": # Mock type
                icon = "Calculator"
        
        nodes.append({
            "id": node_id, 
            "type": "transform", 
            "label": table["title"],
            "x": x_pos, 
            "y": 180, 
            "data": {"icon": icon}
        })
        
        edges.append({"from": last_node_id, "to": node_id})
        last_node_id = node_id
        x_pos += 220
        
    # Fixed Output Node
    nodes.append({
        "id": "export-1", 
        "type": "output", 
        "label": "Export Result",
        "x": x_pos, 
        "y": 180, 
        "data": {"icon": "Download"}
    })
    edges.append({"from": last_node_id, "to": "export-1"})

    # 3. Generate Mock Preview Data based on the prompt context
    # This simulates "actual" data processing result
    preview_data = []
    
    if "그룹" in request.prompt or "group" in request.prompt.lower():
        preview_data = [
            {"dept": "Engineering", "count": 15, "total_budget": 250000, "avg_util": "88%"},
            {"dept": "Sales", "count": 12, "total_budget": 180000, "avg_util": "92%"},
            {"dept": "Marketing", "count": 8, "total_budget": 120000, "avg_util": "85%"},
            {"dept": "HR", "count": 5, "total_budget": 80000, "avg_util": "75%"},
        ]
    elif "필터" in request.prompt or "filter" in request.prompt.lower():
        preview_data = [
            {"date": "2023-10-01", "dept": "Engineering", "status": "Critical", "amount": 5000},
            {"date": "2023-10-05", "dept": "Engineering", "status": "Critical", "amount": 3200},
            {"date": "2023-10-12", "dept": "DevOps", "status": "Critical", "amount": 4500},
        ]
    else:
        # Default mock data
        preview_data = [
            {"dept": "Engineering", "status": "In Progress", "count": 12, "budget": 150000, "util": "85%"},
            {"dept": "Marketing", "status": "In Progress", "count": 8, "budget": 85000, "util": "92%"},
            {"dept": "Sales", "status": "In Progress", "count": 15, "budget": 120000, "util": "78%"},
            {"dept": "HR", "status": "In Progress", "count": 4, "budget": 45000, "util": "65%"},
            {"dept": "Finance", "status": "In Progress", "count": 6, "budget": 95000, "util": "88%"},
        ]

    return {
        "nodes": nodes,
        "connections": edges,
        "previewData": preview_data,
        "plan": plan,
    }


@router.post("/execute")
async def execute_transform(request: ExecuteRequest):
    """
    Execute a smart transform plan directly on an uploaded file and
    return a preview of the transformed data.

    This uses the same planning logic as /generate, but actually runs
    the operations against a DataFrame stored in processor.data_store.
    """
    if request.filename not in processor.data_store:
        raise HTTPException(status_code=404, detail="File not found")

    df = processor.data_store[request.filename]

    # Build a simple schema description from the DataFrame
    schema = {
        "fields": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "shape": df.shape,
    }

    # 1) Plan from prompt + schema
    plan = smart_transformer.generate_plan_from_prompt(request.prompt, schema)

    # 2) Execute plan
    results = smart_transformer.execute_plan(df, plan)

    # Pick the first non-empty table as the main result, otherwise fall back
    preview_df: Optional[pd.DataFrame] = None
    output_name = f"smart_{request.filename}"

    for table_id, table_df in results.items():
        if table_df is not None and not table_df.empty:
            preview_df = table_df
            output_name = f"{table_id}_{request.filename}"
            break

    if preview_df is None:
        preview_df = df.copy()

    # Store the transformed result so it can be exported later (raw types 유지)
    processor.data_store[output_name] = preview_df

    # ---- Build display-friendly preview (dates / KRW formatting) ----
    preview_df_display = preview_df.head(50).copy()

    # 1) Datetime columns → 'YYYY-MM-DD' 문자열로 변환
    for col in preview_df_display.columns:
        series = preview_df_display[col]
        try:
            if pd.api.types.is_datetime64_any_dtype(series) or pd.api.types.is_datetime64tz_dtype(series):
                preview_df_display[col] = pd.to_datetime(series, errors="coerce").dt.strftime("%Y-%m-%d")
            elif series.dtype == object:
                parsed = pd.to_datetime(series, errors="coerce")
                # 절반 이상이 날짜로 파싱되면 날짜 컬럼으로 간주
                if parsed.notna().sum() >= max(1, len(parsed) // 2):
                    preview_df_display[col] = parsed.dt.strftime("%Y-%m-%d")
        except Exception:
            # 날짜 변환 실패 시 원본 유지
            continue

    # 2) 원화(금액) 컬럼 → 천단위 콤마가 있는 문자열로 변환
    currency_tokens = ["amount", "금액", "price", "비용", "amt"]
    for col in preview_df_display.columns:
        col_l = str(col).lower()
        if any(tok in col_l for tok in currency_tokens) and pd.api.types.is_numeric_dtype(preview_df_display[col]):
            def _fmt_krw(v):
                if v is None or (isinstance(v, float) and np.isnan(v)):
                    return None
                try:
                    return f"{int(round(float(v))):,}"
                except Exception:
                    return v
            preview_df_display[col] = preview_df_display[col].apply(_fmt_krw)

    # JSON-serializable preview
    safe_preview = preview_df_display.replace({np.nan: None, pd.NaT: None})
    preview_data = safe_preview.to_dict(orient="records")

    return {
        "success": True,
        "outputFilename": output_name,
        "previewData": preview_data,
        "plan": plan,
    }
