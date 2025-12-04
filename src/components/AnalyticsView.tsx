import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, BarChart3, Lightbulb, FileText, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface AnalyticsViewProps {
  insights?: any[];
  trendData?: any[];
  kpiMetrics?: any[];
  chartMetadata?: any;
}

type TabType = 'overview' | 'charts' | 'analysis';

interface CollapsibleSection {
  id: string;
  title: string;
  content: React.ReactNode;
  icon: React.ComponentType<any>;
}

export function AnalyticsView({ insights = [], trendData = [], kpiMetrics = [], chartMetadata = {} }: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['timeseries', 'distribution', 'correlation', 'dynamic-insights', 'dynamic-kpi']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Overview sections
  const overviewSections: CollapsibleSection[] = [
    ...(insights.length > 0
      ? [
          {
            id: 'dynamic-insights',
            title: 'AI 분석 인사이트',
            icon: Lightbulb,
            content: (
              <ul className="space-y-4 p-4">
                {insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-800 leading-relaxed">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1f2937', marginTop: '7px', flexShrink: 0 }}></span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(kpiMetrics.length > 0
      ? [
          {
            id: 'dynamic-kpi',
            title: '주요 지표 (KPI)',
            icon: Activity,
            content: (
              <div className="grid grid-cols-2 gap-5">
                {kpiMetrics.map((kpi, idx) => (
                  <div
                    key={idx}
                    className={`p-4 bg-${kpi.color || 'blue'}-50 rounded-lg space-y-2`}
                  >
                    <div
                      className={`text-xs text-${kpi.color || 'blue'}-600 font-medium tracking-tight`}
                    >
                      {kpi.label}
                    </div>
                    <div className={`text-2xl font-bold text-${kpi.color || 'blue'}-900`}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

  // Charts sections - Dynamically built based on chartMetadata
  const chartsSections: CollapsibleSection[] = [];

  // 1. Time Series Chart
  if (chartMetadata?.time_series) {
    chartsSections.push({
      id: 'timeseries',
      title: `시계열 추세 (${chartMetadata.time_series.period_label || '기간별'})`,
      icon: TrendingUp,
      content: (
        <div className="h-80 w-full">
          {trendData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                    name={chartMetadata.time_series.value_column || "값"} 
                  />
                </LineChart>
              </ResponsiveContainer>
              {chartMetadata.time_series.reason && (
                <p className="text-sm text-gray-600 mt-4 text-center bg-gray-50 p-3 rounded-lg">
                  💡 {chartMetadata.time_series.reason}
                </p>
              )}
            </>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
               <Activity className="w-10 h-10 mb-2 opacity-20" />
               <span>표시할 시계열 데이터가 충분하지 않습니다.</span>
             </div>
          )}
        </div>
      )
    });
  }

  // 2. Distribution Chart
  if (chartMetadata?.distribution) {
    chartsSections.push({
      id: 'distribution',
      title: `분포 분석 (${chartMetadata.distribution.category_column || '카테고리별'})`,
      icon: BarChart3,
      content: (
        <div className="h-80 w-full">
          {chartMetadata.distribution.data && chartMetadata.distribution.data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartMetadata.distribution.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="#10b981" 
                    name="건수" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
              {chartMetadata.distribution.reason && (
                <p className="text-sm text-gray-600 mt-4 text-center bg-gray-50 p-3 rounded-lg">
                  💡 {chartMetadata.distribution.reason}
                </p>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
               <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
               <span>분포 데이터를 생성할 수 없습니다.</span>
             </div>
          )}
        </div>
      )
    });
  }

  // 3. Correlation Chart (if available in metadata)
  if (chartMetadata?.correlation) {
    chartsSections.push({
      id: 'correlation',
      title: '상관관계 분석',
      icon: Activity,
      content: (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" dataKey="x" name={chartMetadata.correlation.x_label || "X"} tick={{ fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name={chartMetadata.correlation.y_label || "Y"} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px' }} />
              <Legend />
              <Scatter name="데이터 포인트" data={chartMetadata.correlation.data} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4 text-center bg-gray-50 p-3 rounded-lg">
            💡 {chartMetadata.correlation.reason || "두 변수 간의 상관관계를 보여줍니다."}
          </p>
        </div>
      )
    });
  }

  // If no charts are available, show a default empty state in the charts tab
  if (chartsSections.length === 0) {
    chartsSections.push({
      id: 'no-charts',
      title: '차트 데이터 없음',
      icon: BarChart3,
      content: (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
          <p>자동으로 생성할 수 있는 차트 유형을 찾지 못했습니다.</p>
          <p className="text-sm mt-2">데이터에 시간, 수치, 또는 범주형 컬럼이 포함되어 있는지 확인해주세요.</p>
        </div>
      )
    });
  }

  // Analysis (가공) sections - 다양한 2차 가공 결과 노출
  const analysisSections: CollapsibleSection[] = [
    {
      id: 'transform-suggestions',
      title: '가공 제안',
      icon: FileText,
      content: (
        <div className="space-y-6 p-2">
          <div className="px-6 py-5 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="font-semibold text-emerald-900 mb-2">데이터 정제</div>
            <p className="text-sm text-emerald-800 leading-relaxed">
              결측치 보간, 이상치 제거, 스케일 정규화를 통해 분석 모델의 안정성과 예측 정확도를 높일 수 있습니다.
            </p>
          </div>
          <div className="px-6 py-5 bg-blue-50 rounded-xl border border-blue-100">
            <div className="font-semibold text-blue-900 mb-2">파생 변수 생성</div>
            <p className="text-sm text-blue-800 leading-relaxed">
              날짜 컬럼으로부터 요일/월/분기 컬럼을 생성하거나, 금액과 횟수를 결합한 효율 지표를 만들면 더 풍부한 인사이트를 얻을 수 있습니다.
            </p>
          </div>
          <div className="px-6 py-5 bg-purple-50 rounded-xl border border-purple-100">
            <div className="font-semibold text-purple-900 mb-2">그룹 집계</div>
            <p className="text-sm text-purple-800 leading-relaxed">
              고객·상품·기간 단위로 그룹화하여 합계, 평균, 최대/최소값을 계산하면 핵심 KPI를 빠르게 파악할 수 있습니다.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'future-forecast',
      title: '앞으로의 예측',
      icon: Lightbulb,
      content: (
        <div className="space-y-5 p-2">
          <div className="px-6 py-5 bg-blue-50 rounded-xl border border-blue-100">
            <div className="font-semibold text-blue-900 mb-2">다음 주기 예측</div>
            <div className="text-sm text-blue-800 leading-relaxed">
              {trendData.length > 1
                ? (() => {
                    const last = trendData[trendData.length - 1]?.value ?? 0;
                    const prev = trendData[trendData.length - 2]?.value ?? last;
                    const diff = last - prev;
                    const dir = diff > 0 ? '증가' : diff < 0 ? '감소' : '변화 없음';
                    const nextMin = last + diff * 0.5;
                    const nextMax = last + diff * 1.2;
                    return `최근 구간에서 ${dir} 추세가 관측되었습니다. 단순 추세 연장을 가정하면 다음 구간 값은 약 ${nextMin.toFixed(
                      0
                    )} ~ ${nextMax.toFixed(0)} 범위에서 형성될 가능성이 있습니다.`;
                  })()
                : '예측을 위한 시계열 데이터가 충분하지 않습니다.'}
            </div>
          </div>
          <p className="text-xs text-gray-500 px-2">
            * 이 예측은 단순 추세 기반 가정으로, 외부 요인(시즌ality, 프로모션, 정책 변경 등)은 고려하지 않았습니다.
          </p>
        </div>
      )
    },
    {
      id: 'ai-focus',
      title: 'AI가 주목한 포인트',
      icon: Activity,
      content: (
        <div className="space-y-4 p-2">
          {(insights.slice(0, 3).length ? insights.slice(0, 3) : [
            '데이터의 전체 분포와 극단값을 기준으로, 이상치 후보를 자동으로 태깅할 수 있습니다.',
            '기간별 추세를 기준으로 피크 구간과 비수기 구간을 분리하면, 리소스 배분 전략 수립에 도움이 됩니다.',
            '주요 카테고리별 비중을 재분류하면, 수익 기여도가 높은 군집을 별도로 관리할 수 있습니다.'
          ]).map((msg, idx) => (
            <div key={idx} className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">{msg}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  const renderCollapsibleSection = (section: CollapsibleSection) => {
    const isExpanded = expandedSections.has(section.id);
    const Icon = section.icon;

    return (
      <div
        key={section.id}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mb-8 last:mb-0"
      >
        <button
          onClick={() => toggleSection(section.id)}
          className="w-full flex items-center justify-between px-9 py-8 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-7">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white ${
                isExpanded ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-gray-800">{section.title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            {/* Inner padding for expanded content */}
            <div className="px-9 pb-9 pt-5 mt-2 space-y-6">
              {section.content}
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'overview' as TabType, label: '개요', icon: FileText },
    { id: 'charts' as TabType, label: '차트', icon: BarChart3 },
    { id: 'analysis' as TabType, label: '가공', icon: Lightbulb }
  ];

  const getCurrentSections = () => {
    switch (activeTab) {
      case 'overview':
        return overviewSections;
      case 'charts':
        return chartsSections;
      case 'analysis':
        return analysisSections;
      default:
        return [];
    }
  };

  return (
    <div className="h-full overflow-auto bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header (no gradient) */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
              <BarChart3 className="w-7 h-7 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Report</h1>
              <p className="text-gray-600 mt-1">AI가 분석한 데이터 구조, 패턴, 가공 아이디어를 한눈에 확인하세요.</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Simplified (horizontal, full-width) with custom separators */}
        <div className="mb-8 flex flex-row items-stretch w-full border-b border-gray-200">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <React.Fragment key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 text-base md:text-lg transition-all duration-150
                    border-b-2
                    ${isActive
                      ? 'border-blue-600 text-blue-700 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="leading-none">{tab.label}</span>
                </button>
                {index < tabs.length - 1 && (
                  <div className="w-[2px] h-10 bg-gray-900 rounded-full mx-4" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {getCurrentSections().length > 0 ? (
            getCurrentSections().map((section) => renderCollapsibleSection(section))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">표시할 데이터가 없습니다</h3>
              <p className="text-gray-500 max-w-md text-center">
                데이터 소스 탭에서 파일을 선택하고 분석을 실행하면<br/>이곳에 상세한 분석 결과가 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
