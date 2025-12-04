import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface AnalysisSuggestionsProps {
  data: any[];
}

export function AnalysisSuggestions({ data }: AnalysisSuggestionsProps) {
  const suggestions = [
    {
      id: 1,
      title: '진행률 분석',
      description: '프로젝트별 완료율을 시각화하여 전체 진척도를 한눈에 파악하세요',
      impact: 'high',
      category: 'visualization',
      icon: TrendingUp,
    },
    {
      id: 2,
      title: '예산 효율성 분석',
      description: '예산 대비 진행률을 분석하여 비용 효율성이 낮은 프로젝트를 식별하세요',
      impact: 'high',
      category: 'insight',
      icon: AlertCircle,
    },
    {
      id: 3,
      title: '상태별 그룹화',
      description: '프로젝트 상태별로 데이터를 그룹화하여 각 단계의 현황을 파악하세요',
      impact: 'medium',
      category: 'organization',
      icon: CheckCircle,
    },
    {
      id: 4,
      title: '추세 예측',
      description: 'AI를 활용하여 프로젝트 완료 예상 시점과 최종 예산을 예측하세요',
      impact: 'high',
      category: 'ai',
      icon: Sparkles,
    },
  ];

  const insights = [
    {
      type: 'warning',
      title: '주의가 필요한 항목',
      content: '진행률이 낮은데 예산 소진이 높은 프로젝트가 2건 발견되었습니다.',
      items: ['프로젝트 D: 45% 완료, 예산 사용률 85%'],
    },
    {
      type: 'success',
      title: '우수 성과',
      content: '예산 대비 높은 진행률을 보이는 프로젝트가 있습니다.',
      items: ['프로젝트 E: 60% 완료, 예산 사용률 48%'],
    },
    {
      type: 'info',
      title: '전체 현황',
      content: '전체 프로젝트의 평균 진행률과 예산 사용률입니다.',
      items: ['평균 진행률: 56%', '평균 예산 사용률: 72%'],
    },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
            <div className="text-2xl text-blue-400 mb-1">4</div>
            <div className="text-sm text-gray-400">AI 제안</div>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
            <div className="text-2xl text-green-400 mb-1">3</div>
            <div className="text-sm text-gray-400">주요 인사이트</div>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded">
            <div className="text-2xl text-purple-400 mb-1">85%</div>
            <div className="text-sm text-gray-400">데이터 품질</div>
          </div>
        </div>

        {/* Insights */}
        <div>
          <h2 className="text-lg text-white mb-4">주요 인사이트</h2>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`
                  p-4 border rounded
                  ${insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : ''}
                  ${insight.type === 'success' ? 'bg-green-500/10 border-green-500/30' : ''}
                  ${insight.type === 'info' ? 'bg-blue-500/10 border-blue-500/30' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${insight.type === 'warning' ? 'bg-yellow-500/20' : ''}
                      ${insight.type === 'success' ? 'bg-green-500/20' : ''}
                      ${insight.type === 'info' ? 'bg-blue-500/20' : ''}
                    `}
                  >
                    <AlertCircle
                      className={`
                        w-4 h-4
                        ${insight.type === 'warning' ? 'text-yellow-400' : ''}
                        ${insight.type === 'success' ? 'text-green-400' : ''}
                        ${insight.type === 'info' ? 'text-blue-400' : ''}
                      `}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-white mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{insight.content}</p>
                    <ul className="space-y-1">
                      {insight.items.map((item, i) => (
                        <li key={i} className="text-xs text-gray-500">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h2 className="text-lg text-white mb-4">AI 분석 제안</h2>
          <div className="grid grid-cols-2 gap-4">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <div
                  key={suggestion.id}
                  className="p-5 bg-gray-900/30 border border-gray-800 rounded hover:border-gray-700 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm text-white">{suggestion.title}</h3>
                        <span
                          className={`
                            px-2 py-0.5 rounded text-xs
                            ${suggestion.impact === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : ''}
                            ${suggestion.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : ''}
                          `}
                        >
                          {suggestion.impact === 'high' ? '높은 영향' : '보통 영향'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{suggestion.description}</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-sm rounded transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    적용하기
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Quality */}
        <div className="p-5 bg-gray-900/30 border border-gray-800 rounded">
          <h3 className="text-sm text-white mb-4">데이터 품질 분석</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="text-gray-400">완성도</span>
                <span className="text-green-400">95%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '95%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="text-gray-400">일관성</span>
                <span className="text-blue-400">88%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '88%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="text-gray-400">정확성</span>
                <span className="text-purple-400">92%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
