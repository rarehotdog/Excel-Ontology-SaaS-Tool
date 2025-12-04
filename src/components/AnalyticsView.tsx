import { TrendingUp, PieChart, BarChart3, Activity, Sparkles, Zap } from 'lucide-react';

export function AnalyticsView() {
  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900 mb-1">Analytics</h1>
                <p className="text-gray-600">데이터 인사이트와 시각화</p>
              </div>
            </div>
            <select className="px-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-700 focus:outline-none focus:border-orange-300">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-8 shadow-xl shadow-emerald-200/50 text-white">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm text-emerald-100 mb-1">Total Records</div>
              <div className="text-4xl mb-2">18,942</div>
              <div className="text-xs text-emerald-100">↑ 12.5% from last period</div>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-8 shadow-xl shadow-blue-200/50 text-white">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm text-blue-100 mb-1">Transformations</div>
              <div className="text-4xl mb-2">342</div>
              <div className="text-xs text-blue-100">↑ 8.2% from last period</div>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-8 shadow-xl shadow-purple-200/50 text-white">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm text-purple-100 mb-1">Data Quality</div>
              <div className="text-4xl mb-2">94.3%</div>
              <div className="text-xs text-purple-100">↑ 2.1% from last period</div>
            </div>

            <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl p-8 shadow-xl shadow-pink-200/50 text-white">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm text-pink-100 mb-1">Processing Time</div>
              <div className="text-4xl mb-2">1.2s</div>
              <div className="text-xs text-pink-100">↓ 15.3% from last period</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
              <h3 className="text-xl text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Data Processing Trend
              </h3>
              <div className="h-80 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200 animate-pulse">
                    <BarChart3 className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-600">Chart visualization</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
              <h3 className="text-xl text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                Entity Distribution
              </h3>
              <div className="h-80 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-200 animate-pulse">
                    <PieChart className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-600">Chart visualization</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-xl shadow-purple-200/50">
            <div className="bg-white rounded-3xl p-8">
              <h3 className="text-xl text-gray-900 mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI Insights
              </h3>
              <div className="space-y-4">
                {[
                  { type: 'success', text: '프로젝트 완료율이 예상보다 15% 높습니다', impact: '긍정적', gradient: 'from-emerald-400 to-emerald-600' },
                  { type: 'warning', text: '2개 프로젝트의 예산 사용률이 평균보다 높습니다', impact: '주의 필요', gradient: 'from-orange-400 to-orange-600' },
                  { type: 'info', text: 'Q4 데이터 품질이 93%로 목표를 달성했습니다', impact: '정보', gradient: 'from-blue-400 to-blue-600' },
                ].map((insight, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-2xl transition-all hover:scale-102 hover:shadow-lg cursor-pointer"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${insight.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-1">{insight.text}</p>
                      <span className="inline-block px-3 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-200">
                        {insight.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
