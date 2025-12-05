import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, BarChart3, Lightbulb, FileText, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface TransformSuggestion {
  title: string;
  description: string;
  priority?: string;
  color?: string;
}

interface FuturePrediction {
  title: string;
  description: string;
  confidence?: string;
  trend?: string;
}

interface AIFocusPoint {
  title: string;
  description: string;
  type?: string;
  severity?: string;
}

interface AnalyticsViewProps {
  insights?: any[];
  trendData?: any[];
  kpiMetrics?: any[];
  chartMetadata?: any;
  // 2차 분석 데이터
  transform_suggestions?: TransformSuggestion[];
  future_predictions?: FuturePrediction[];
  ai_focus_points?: AIFocusPoint[];
}

type TabType = 'overview' | 'charts' | 'analysis';

interface CollapsibleSection {
  id: string;
  title: string;
  content: React.ReactNode;
  icon: React.ComponentType<any>;
}

export function AnalyticsView({ 
  insights = [], 
  trendData = [], 
  kpiMetrics = [], 
  chartMetadata = {},
  transform_suggestions = [],
  future_predictions = [],
  ai_focus_points = []
}: AnalyticsViewProps) {
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

  // 색상 매핑 헬퍼
  const getColorClasses = (color?: string) => {
    const colorMap: Record<string, { bg: string; border: string; title: string; text: string }> = {
      red: { bg: 'bg-red-50', border: 'border-red-100', title: 'text-red-900', text: 'text-red-800' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-100', title: 'text-amber-900', text: 'text-amber-800' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-100', title: 'text-blue-900', text: 'text-blue-800' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-100', title: 'text-purple-900', text: 'text-purple-800' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', title: 'text-emerald-900', text: 'text-emerald-800' },
    };
    return colorMap[color || 'blue'] || colorMap.blue;
  };

  // Analysis (가공) sections - 2차 분석 데이터 기반
  const analysisSections: CollapsibleSection[] = [];
  
  // 가공 제안 - transform_suggestions 사용
  if (transform_suggestions.length > 0) {
    analysisSections.push({
      id: 'transform-suggestions',
      title: '가공 제안',
      icon: FileText,
      content: (
        <div className="space-y-6 p-2">
          {transform_suggestions.map((suggestion, idx) => {
            const colors = getColorClasses(suggestion.color);
            return (
              <div key={idx} className={`px-6 py-5 rounded-xl border ${colors.bg} ${colors.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`font-semibold ${colors.title}`}>{suggestion.title}</div>
                  {suggestion.priority && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {suggestion.priority === 'high' ? '높음' : suggestion.priority === 'medium' ? '중간' : '낮음'}
                    </span>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${colors.text}`}>{suggestion.description}</p>
              </div>
            );
          })}
        </div>
      )
    });
  }
  
  // 앞으로의 예측 - future_predictions 사용
  if (future_predictions.length > 0) {
    analysisSections.push({
      id: 'future-forecast',
      title: '앞으로의 예측',
      icon: Lightbulb,
      content: (
        <div className="space-y-5 p-2">
          {future_predictions.map((prediction, idx) => (
            <div key={idx} className="px-6 py-5 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-blue-900">{prediction.title}</div>
                <div className="flex items-center gap-2">
                  {prediction.trend && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      prediction.trend === '증가' ? 'bg-emerald-100 text-emerald-700' :
                      prediction.trend === '감소' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {prediction.trend}
                    </span>
                  )}
                  {prediction.confidence && (
                    <span className="text-xs text-blue-600">신뢰도 {prediction.confidence}</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{prediction.description}</p>
            </div>
          ))}
          <p className="text-xs text-gray-500 px-2">
            * 이 예측은 과거 데이터 추세 기반으로, 외부 요인(계절성, 프로모션 등)은 고려하지 않았습니다.
          </p>
        </div>
      )
    });
  }
  
  // AI가 주목한 포인트 - ai_focus_points 사용 (핵심!)
  if (ai_focus_points.length > 0) {
    analysisSections.push({
      id: 'ai-focus',
      title: 'AI가 주목한 포인트',
      icon: Activity,
      content: (
        <div className="space-y-4 p-2">
          {ai_focus_points.map((point, idx) => {
            const severityColors: Record<string, { bg: string; border: string; badge: string }> = {
              high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
              warning: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
              info: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
              low: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
            };
            const colors = severityColors[point.severity || 'info'] || severityColors.info;
            
            const typeLabels: Record<string, string> = {
              anomaly: '🔍 이상치',
              volatility: '📊 변동성',
              trend: '📈 트렌드',
              peak: '⭐ 피크',
              distribution: '📉 분포',
            };
            
            return (
              <div key={idx} className={`px-6 py-4 rounded-xl border ${colors.bg} ${colors.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {typeLabels[point.type || ''] && (
                      <span className="text-sm">{typeLabels[point.type || ''].split(' ')[0]}</span>
                    )}
                    {point.title}
                  </div>
                  {point.severity && (
                    <span className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
                      {point.severity === 'high' ? '중요' : 
                       point.severity === 'warning' ? '주의' : '참고'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{point.description}</p>
              </div>
            );
          })}
        </div>
      )
    });
  }

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
