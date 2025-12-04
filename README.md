# 🤖 Excel Ontology Platform

자연어 명령으로 엑셀 데이터를 변환하고, 다중 파일 대사를 자동화하는 웹 기반 플랫폼이다.

---

## ✨ 핵심 기능

### 📊 Smart Transform
자연어 입력으로 데이터 변환 파이프라인을 자동 생성한다. "상태별로 그룹화하고 평균 예산을 계산해줘"와 같은 명령을 입력하면 Filter, GroupBy, Calculate 노드로 구성된 파이프라인이 ReactFlow 캔버스에 시각화된다. 드래그 앤 드롭으로 노드를 추가하거나 연결을 수정할 수 있으며, 변환 결과를 CSV로 즉시 다운로드한다.

### 🔄 Settlement (정산/대사)
무결성 검증 모드와 비교 분석 모드를 제공한다. 무결성 검증 모드는 운임, 카드, 빌링 등 다중 소스 데이터를 대조하여 불일치 항목을 탐지한다. 비교 분석 모드는 업로드된 파일 목록에서 A/B 파일을 선택하고 키 매핑 후 차이를 분석한다. 6단계 워크플로우(파일 선택 → 키 매핑 → 규칙 설정 → 실행 → 드릴다운 → 리포트)로 진행 상황을 추적한다.

### 🛡️ Data Management
Excel(.xlsx, .xls), CSV 파일을 업로드하면 Pandas가 파싱하여 행 수, 열 수, 컬럼명 등 메타데이터를 즉시 추출한다. 업로드된 파일은 인메모리 data_store에 저장되며, `/data/list` 엔드포인트로 목록을 조회한다. 변환된 결과는 Excel, CSV, JSON 형식으로 내보내기가 가능하다.

---

## 🤖 AI 기술 활용

### 자연어 파이프라인 생성
SmartTransformer 클래스가 사용자의 프롬프트를 분석하여 변환 계획을 생성한다. `generate_plan_from_prompt()` 메서드는 "그룹", "필터", "정렬", "계산" 등의 키워드를 추출하고 해당하는 변환 연산(GROUP_BY, FILTER, ORDER_BY, CALCULATE)을 노드로 매핑한다. 생성된 계획은 `{ nodes: [], connections: [], previewData: [] }` 형식으로 반환되어 프론트엔드에서 즉시 렌더링된다.

### 컨텍스트 기반 미리보기 데이터 생성
프롬프트의 키워드에 따라 적절한 샘플 데이터를 생성한다. "그룹"이 포함되면 부서별 집계 데이터(dept, count, total_budget, avg_util)가, "필터"가 포함되면 조건 매칭 행이 previewData로 반환된다. 이를 통해 실제 데이터 처리 전에 예상 결과를 확인할 수 있다.

### 스키마 인식 변환
업로드된 파일의 스키마(컬럼명, 데이터 타입)를 자동으로 인식하여 변환 계획에 반영한다. mock_schema 객체를 통해 Date, Dept, Amount, Status, Region, Category 등의 필드 정보가 SmartTransformer에 전달되며, 프롬프트와 스키마를 조합하여 적합한 변환 연산을 결정한다.

### 파이프라인 노드 자동 배치
생성된 파이프라인 노드의 위치(x, y 좌표)를 자동으로 계산하여 가독성 있는 레이아웃을 구성한다. 입력 노드는 x=100에서 시작하고, 각 변환 노드는 220px 간격으로 배치되며, 출력 노드가 마지막에 위치한다. 노드 간 연결선은 gradient와 glow 효과가 적용되어 데이터 흐름을 시각적으로 표현한다.

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Dashboard │  │  Smart   │  │Settlement│  │Analytics │    │
│  │          │  │Transform │  │          │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│        │            │              │             │          │
│        └────────────┴──────────────┴─────────────┘          │
│                           │                                  │
│                    ReactFlow Canvas                          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────┴─────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │/data/*   │  │/smart-   │  │/settle-  │  │/analytics│    │
│  │          │  │transform │  │ment      │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│        │            │              │             │          │
│        └────────────┴──────────────┴─────────────┘          │
│                           │                                  │
│              SmartTransformer / Pandas / NumPy               │
└─────────────────────────────────────────────────────────────┘
```

### 기술 스택
- **Frontend**: React 18 + TypeScript + Tailwind CSS 4.0 + ReactFlow
- **Backend**: FastAPI + Python 3.11 + Pandas + NumPy
- **Database**: In-memory data_store (dict 기반)
- **AI Models**: 키워드 기반 SmartTransformer (LLM 확장 가능 구조)
- **Deploy**: Local Development (Vite + Uvicorn)

---

## 📂 프로젝트 구조

```
fpr/
├── backend/
│   ├── app/
│   │   ├── api/routers/
│   │   │   ├── data.py           # 파일 업로드/목록 API
│   │   │   ├── smart_transform.py # 자연어 변환 API
│   │   │   ├── settlement.py     # 정산/대사 API
│   │   │   ├── analytics.py      # 분석 API
│   │   │   └── export.py         # 내보내기 API
│   │   ├── core/
│   │   │   ├── smart_transformer.py # AI 변환 로직
│   │   │   ├── processor.py      # 파일 처리
│   │   │   └── lineage.py        # 데이터 계보 추적
│   │   ├── main.py               # FastAPI 앱 진입점
│   │   └── services.py           # 서비스 인스턴스
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── SmartTransformView.tsx # Smart Transform UI
│   │   ├── PipelineCanvas.tsx     # ReactFlow 캔버스
│   │   ├── SettlementView.tsx     # 정산 메인 UI
│   │   ├── settlement/            # 정산 단계별 컴포넌트
│   │   │   ├── StepFileSelection.tsx
│   │   │   ├── StepKeyMapping.tsx
│   │   │   ├── StepRuleSettings.tsx
│   │   │   ├── StepExecution.tsx
│   │   │   ├── StepDrillDown.tsx
│   │   │   └── StepReport.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DataSources.tsx
│   │   └── AnalyticsView.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 🚀 빠른 시작

### 1. 사전 준비
- Node.js 18+
- Python 3.11+
- npm 또는 yarn

### 2. 백엔드 설정
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. 프론트엔드 설정
```bash
npm install
npm run dev
```

### 4. 접속
브라우저에서 `http://localhost:5173` 으로 접속한다. 백엔드 API는 `http://localhost:8000`에서 실행된다.

---

## 🔐 보안

- 파일 업로드 시 임시 파일은 처리 후 즉시 삭제된다 (`os.remove(temp_path)`)
- CORS 설정으로 허용된 origin만 API 접근 가능하다
- 업로드된 데이터는 서버 메모리에만 존재하며 영구 저장되지 않는다

---

## 📝 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/data/upload` | 파일 업로드 |
| GET | `/data/list` | 업로드된 파일 목록 |
| POST | `/smart-transform/generate` | 자연어 → 파이프라인 생성 |
| POST | `/settlement/franchise/check` | 무결성 검증 실행 |
| POST | `/settlement/biz/compare` | A/B 파일 비교 |
| GET | `/analytics/summary` | 데이터 요약 통계 |
| GET | `/export/download` | 파일 다운로드 |

---

## 🤝 기여

1. 이 저장소를 Fork 한다
2. 기능 브랜치를 생성한다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋한다 (`git commit -m 'Add AmazingFeature'`)
4. 브랜치에 Push 한다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성한다

---

## 📄 라이선스

MIT License

---

## 📞 지원

- GitHub Issues: 버그 리포트 및 기능 요청
- Email: support@example.com

---

**Made with ❤️ by Excel Ontology Team**
