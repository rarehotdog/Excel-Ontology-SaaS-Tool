import { ArrowRight, Database, Workflow, BarChart3, Upload, Sparkles, TrendingUp, Zap } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'sources' | 'pipeline' | 'ontology' | 'analytics' | 'exports') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-gray-900">Excel Ontology Platform</h1>
              <p className="text-gray-600">AI 기반 데이터 변환 및 분석 플랫폼</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Quick Start - 최상단으로 이동 */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-xl shadow-purple-200/50 text-white">
            <h3 className="text-2xl mb-2 flex items-center gap-3">
              <Sparkles className="w-7 h-7" />
              Quick Start
            </h3>
            <p className="text-sm text-white/80 mb-6">3단계로 시작하는 데이터 변환</p>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => onNavigate('sources')}
                className="group px-6 py-6 bg-white/20 backdrop-blur hover:bg-white/30 rounded-2xl transition-all hover:scale-105 shadow-lg text-left"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-lg mb-1">1. Upload Data</div>
                <div className="text-sm text-white/70">엑셀 파일 업로드</div>
              </button>
              <button
                onClick={() => onNavigate('pipeline')}
                className="group px-6 py-6 bg-white/20 backdrop-blur hover:bg-white/30 rounded-2xl transition-all hover:scale-105 shadow-lg text-left"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Workflow className="w-6 h-6" />
                </div>
                <div className="text-lg mb-1">2. Transform</div>
                <div className="text-sm text-white/70">자연어로 변환 요청</div>
              </button>
              <button
                onClick={() => onNavigate('analytics')}
                className="group px-6 py-6 bg-white/20 backdrop-blur hover:bg-white/30 rounded-2xl transition-all hover:scale-105 shadow-lg text-left"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="text-lg mb-1">3. Analyze</div>
                <div className="text-sm text-white/70">AI 인사이트 확인</div>
              </button>
            </div>
          </div>

          {/* Stats - 컴팩트하게 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl text-gray-900">12</div>
              </div>
              <div className="text-sm text-gray-600">Data Sources</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl text-gray-900">8</div>
              </div>
              <div className="text-sm text-gray-600">Active Pipelines</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl text-gray-900">24</div>
              </div>
              <div className="text-sm text-gray-600">Entities</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl text-gray-900">156</div>
              </div>
              <div className="text-sm text-gray-600">Transformations</div>
            </div>
          </div>

          {/* Platform Architecture - 간소화 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
            <h2 className="text-xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Platform Overview
            </h2>

            {/* 3-Layer Architecture - 컴팩트 버전 */}
            <div className="space-y-4">
              {/* Application Layer */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => onNavigate('analytics')}
                  className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-gray-900">Analytics</h3>
                  </div>
                  <p className="text-sm text-gray-600">데이터 분석</p>
                </button>

                <button
                  onClick={() => onNavigate('pipeline')}
                  className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Workflow className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-gray-900">Workflows</h3>
                  </div>
                  <p className="text-sm text-gray-600">자동화 파이프라인</p>
                </button>

                <button
                  onClick={() => onNavigate('exports')}
                  className="group p-6 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-2xl transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-gray-900">Integrations</h3>
                  </div>
                  <p className="text-sm text-gray-600">외부 연동</p>
                </button>
              </div>

              {/* Ontology Layer */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                  <span className="text-sm text-gray-600">Ontology Layer</span>
                </div>
                <button
                  onClick={() => onNavigate('ontology')}
                  className="group w-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                        <Database className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl mb-2">Ontology Core</h3>
                        <p className="text-emerald-50">
                          엔티티, 관계, 속성을 정의하고 연결하는 핵심 레이어
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                  </div>

                  {/* Entity Relationships Visualization */}
                  <div className="space-y-4">
                    {/* Main Entities with Connections */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Database className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm">Projects</span>
                        </div>
                        <div className="text-xs text-emerald-100 mb-2">핵심 엔티티</div>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">id</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">name</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">budget</span>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm">Tasks</span>
                        </div>
                        <div className="text-xs text-emerald-100 mb-2">하위 엔티티</div>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">title</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">status</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">priority</span>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm">Users</span>
                        </div>
                        <div className="text-xs text-emerald-100 mb-2">관련 엔티티</div>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">name</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">role</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">email</span>
                        </div>
                      </div>
                    </div>

                    {/* What You Can Do */}
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                      <div className="text-sm mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>할 수 있는 작업:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 flex-shrink-0" />
                          <span>엔티티 간 관계 정의 (1:N, N:M)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 flex-shrink-0" />
                          <span>속성 자동 추론 및 타입 검증</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 flex-shrink-0" />
                          <span>데이터 흐름 시각화 및 추적</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 flex-shrink-0" />
                          <span>엑셀 시트 간 관계 매핑</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 flex-shrink-0" />
                          <span>스키마 자동 생성 및 검증</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 flex-shrink-0" />
                          <span>데이터 정합성 실시간 체크</span>
                        </div>
                      </div>
                    </div>

                    {/* Use Case Example */}
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                      <div className="text-sm mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>사용 예시:</span>
                      </div>
                      <div className="text-xs text-emerald-100 leading-relaxed">
                        "프로젝트 엑셀에서 <span className="text-white font-medium">예산</span>과
                        작업 엑셀의 <span className="text-white font-medium">완료율</span>을 자동으로 연결하고,
                        담당자별 <span className="text-white font-medium">성과 지표</span>를 실시간으로 계산할 수 있습니다."
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Data Layer */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onNavigate('sources')}
                  className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-gray-900">Data Sources</h3>
                  </div>
                  <p className="text-sm text-gray-600">Excel, CSV 연결</p>
                </button>

                <button
                  onClick={() => onNavigate('pipeline')}
                  className="group p-6 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-2xl transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Workflow className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-gray-900">AI Models</h3>
                  </div>
                  <p className="text-sm text-gray-600">데이터 변환 모델</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
