import { useState } from 'react';
import { Network, Plus, Search, Sparkles, Zap, Database, Link2, GitBranch, Clock, FileSpreadsheet, AlertCircle, Check, ChevronRight, Calendar, TrendingUp } from 'lucide-react';

type TabType = 'concepts' | 'time' | 'templates';

export function OntologyView() {
  const [activeTab, setActiveTab] = useState<TabType>('concepts');
  const [selectedConcept, setSelectedConcept] = useState<string | null>('merchant');
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  // Concept 데이터
  const concepts = [
    {
      id: 'branch',
      name: 'Branch (가맹본부)',
      type: 'entity',
      fields: [
        { column: '가맹본부', file: '2024_07_가맹정산.xlsx', sheet: '정산raw', example: '강남본부' },
        { column: '본부명', file: '2024_10_운임raw.xlsx', sheet: '운임raw1', example: '강남본부' },
      ],
      count: 8,
      color: 'blue',
      status: 'confirmed'
    },
    {
      id: 'merchant',
      name: 'Merchant (가맹점)',
      type: 'entity',
      fields: [
        { column: '가맹점명', file: '2024_07_가맹정산.xlsx', sheet: '정산raw', example: '주디가맹점' },
        { column: '지점명', file: '2024_10_운임raw.xlsx', sheet: '운임raw1', example: '주디가맹점' },
        { column: '점포명', file: '2024_10_프로모션.xlsx', sheet: 'promo_stat', example: '주디가맹점' },
      ],
      count: 142,
      color: 'emerald',
      status: 'confirmed'
    },
    {
      id: 'vehicle',
      name: 'Vehicle (차량)',
      type: 'entity',
      fields: [
        { column: '차량번호', file: '2024_10_운임raw.xlsx', sheet: '운임raw1', example: '12가1234' },
        { column: 'PlateNo', file: '2024_10_빌링데이터.xlsx', sheet: 'billing', example: '12가1234' },
      ],
      count: 324,
      color: 'purple',
      status: 'confirmed'
    },
    {
      id: 'driver',
      name: 'Driver (기사)',
      type: 'entity',
      fields: [
        { column: '기사명', file: '2024_10_운임raw.xlsx', sheet: '운임raw1', example: '김철수' },
        { column: 'DriverName', file: '2024_10_빌링데이터.xlsx', sheet: 'billing', example: '김철수' },
      ],
      count: 256,
      color: 'pink',
      status: 'pending'
    },
    {
      id: 'time',
      name: 'Time (기간)',
      type: 'time',
      fields: [
        { column: '정산월', file: '2024_07_가맹정산.xlsx', sheet: '정산raw', example: '2024-07' },
        { column: 'yyyyMM', file: '2024_10_운임raw.xlsx', sheet: '운임raw1', example: '202410' },
        { column: 'Date', file: '2024_10_빌링데이터.xlsx', sheet: 'billing', example: '2024-10-15' },
      ],
      count: 0,
      color: 'orange',
      status: 'confirmed'
    },
    {
      id: 'fare',
      name: 'Metric: Fare (운임)',
      type: 'metric',
      fields: [
        { column: '운임', file: '2024_10_운임raw.xlsx', sheet: '운임raw1', example: '15000' },
        { column: '매출금액', file: '2024_07_가맹정산.xlsx', sheet: '정산raw', example: '15000' },
        { column: 'Revenue', file: '2024_10_빌링데이터.xlsx', sheet: 'billing', example: '15000' },
      ],
      count: 0,
      color: 'teal',
      status: 'confirmed'
    },
    {
      id: 'margin',
      name: 'Metric: Margin (마진)',
      type: 'metric',
      fields: [
        { column: '마진율', file: '2024_07_가맹정산.xlsx', sheet: '정산raw', example: '12.5' },
        { column: 'Margin%', file: '손익_2024Q3.xlsx', sheet: 'summary', example: '12.5' },
      ],
      count: 0,
      color: 'indigo',
      status: 'pending'
    },
  ];

  // Snapshot 데이터
  const snapshots = [
    {
      id: 'snap-2024-07',
      label: '2024-07 가맹정산',
      period: { start: '2024-07-01', end: '2024-07-31' },
      sources: ['2024_07_가맹정산.xlsx'],
      metrics: { fare: 125000000, margin: 12.3, count: 3420 },
      color: 'blue'
    },
    {
      id: 'snap-2024-08',
      label: '2024-08 운임 Raw',
      period: { start: '2024-08-01', end: '2024-08-31' },
      sources: ['2024_08_운임raw.xlsx'],
      metrics: { fare: 132000000, margin: 11.8, count: 3680 },
      color: 'emerald'
    },
    {
      id: 'snap-2024-09',
      label: '2024-09 운임 + 프로모션',
      period: { start: '2024-09-01', end: '2024-09-30' },
      sources: ['2024_09_운임raw.xlsx', '2024_09_프로모션.xlsx'],
      metrics: { fare: 145000000, margin: 13.5, count: 4120 },
      color: 'purple'
    },
    {
      id: 'snap-2024-10',
      label: '2024-10 통합 데이터',
      period: { start: '2024-10-01', end: '2024-10-31' },
      sources: ['2024_10_운임raw.xlsx', '2024_10_빌링데이터.xlsx', '2024_10_프로모션.xlsx'],
      metrics: { fare: 158000000, margin: 14.2, count: 4580 },
      color: 'pink'
    },
  ];

  // Decision Templates
  const templates = [
    {
      id: 'template-1',
      name: '지난달 대비 매출/마진 변화 요약',
      decision: '이번 달 어떤 가맹본부를 우선 관리해야 할까?',
      impactMetrics: ['fare', 'margin'],
      dimensions: ['branch'],
      timeScope: { mode: 'month_over_month', monthsBack: 1 },
      usageCount: 24
    },
    {
      id: 'template-2',
      name: '가맹점별 성과 트렌드 분석',
      decision: '어떤 가맹점의 실적이 개선/악화되고 있는가?',
      impactMetrics: ['fare', 'margin', 'count'],
      dimensions: ['merchant', 'branch'],
      timeScope: { mode: 'range', monthsBack: 6 },
      usageCount: 18
    },
    {
      id: 'template-3',
      name: '프로모션 영향 분석',
      decision: '프로모션이 매출과 마진에 어떤 영향을 미쳤는가?',
      impactMetrics: ['fare', 'margin'],
      dimensions: ['merchant', 'time'],
      timeScope: { mode: 'range', monthsBack: 3 },
      usageCount: 12
    },
  ];

  return (
    <div className="h-full overflow-auto bg-gray-50">
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                <Network className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Ontology Layer</h1>
                <p className="text-gray-600">시트/파일 데이터를 비즈니스 개념과 시간 축으로 연결하는 의미 레이어</p>
              </div>
            </div>
            <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Sparkles className="w-6 h-6" />
              <span>Auto Infer</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${activeTab === 'concepts'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              <Database className="w-5 h-5" />
              <span>Concept Map</span>
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${activeTab === 'time'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              <Clock className="w-5 h-5" />
              <span>Time & Snapshot</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${activeTab === 'templates'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              <GitBranch className="w-5 h-5" />
              <span>Decision Templates</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="flex gap-6">
          {/* Left: Concept/Time Tree */}
          <div className="w-96 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-purple-100/50">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'concepts' ? 'Search concepts...' : activeTab === 'time' ? 'Search snapshots...' : 'Search templates...'}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:bg-white transition-all"
              />
            </div>

            {activeTab === 'concepts' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{concepts.filter(c => c.type === 'entity').length}</div>
                    <div className="text-xs text-gray-600">Entities</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{concepts.filter(c => c.type === 'metric').length}</div>
                    <div className="text-xs text-gray-600">Metrics</div>
                  </div>
                </div>

                {/* Concept List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Entities</div>
                  {concepts.filter(c => c.type === 'entity').map((concept) => (
                    <button
                      key={concept.id}
                      onClick={() => setSelectedConcept(concept.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${selectedConcept === concept.id
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{concept.name}</span>
                        <div className="flex items-center gap-2">
                          {concept.status === 'confirmed' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${selectedConcept === concept.id ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                            }`}>
                            {concept.count}
                          </span>
                        </div>
                      </div>
                      <div className={`text-xs ${selectedConcept === concept.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {concept.fields.length} fields mapped
                      </div>
                    </button>
                  ))}

                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">Metrics</div>
                  {concepts.filter(c => c.type === 'metric' || c.type === 'time').map((concept) => (
                    <button
                      key={concept.id}
                      onClick={() => setSelectedConcept(concept.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${selectedConcept === concept.id
                          ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{concept.name}</span>
                        {concept.status === 'confirmed' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className={`text-xs ${selectedConcept === concept.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {concept.fields.length} fields mapped
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'time' && (
              <div className="space-y-3">
                {snapshots.map((snapshot) => (
                  <button
                    key={snapshot.id}
                    onClick={() => setSelectedSnapshot(snapshot.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${selectedSnapshot === snapshot.id
                        ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{snapshot.label}</span>
                    </div>
                    <div className={`text-xs ${selectedSnapshot === snapshot.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {snapshot.period.start} ~ {snapshot.period.end}
                    </div>
                    <div className={`text-xs mt-1 ${selectedSnapshot === snapshot.id ? 'text-white/60' : 'text-gray-400'}`}>
                      {snapshot.sources.length} source(s)
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{template.name}</span>
                      <span className="text-xs px-2 py-1 bg-emerald-200 text-emerald-700 rounded-full">
                        {template.usageCount}회
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{template.decision}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.dimensions.map(dim => (
                        <span key={dim} className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600">
                          {dim}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center: Detail Panel */}
          <div className="flex-1">
            {activeTab === 'concepts' && selectedConcept && (
              <div className="space-y-6">
                {(() => {
                  const concept = concepts.find(c => c.id === selectedConcept);
                  if (!concept) return null;

                  return (
                    <>
                      {/* Concept Header */}
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <Database className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-1">{concept.name}</h2>
                              <div className="flex gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {concept.type}
                                </span>
                                {concept.status === 'confirmed' ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Confirmed
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Pending Review
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all font-medium">
                              Edit
                            </button>
                            {concept.status === 'pending' && (
                              <button className="px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all font-medium">
                                Approve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Field Mapping Table */}
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <Link2 className="w-6 h-6 text-blue-600" />
                          Mapped Fields ({concept.fields.length})
                        </h3>
                        <div className="overflow-hidden rounded-2xl border-2 border-gray-200">
                          <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Column Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">File</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Sheet</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Example Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {concept.fields.map((field, idx) => (
                                <tr key={idx} className="border-t border-gray-200 hover:bg-blue-50/50 transition-colors">
                                  <td className="px-4 py-3 text-gray-900 font-medium">{field.column}</td>
                                  <td className="px-4 py-3 text-gray-600">{field.file}</td>
                                  <td className="px-4 py-3 text-gray-600">{field.sheet}</td>
                                  <td className="px-4 py-3">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                                      {field.example}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab === 'time' && selectedSnapshot && (
              <div className="space-y-6">
                {(() => {
                  const snapshot = snapshots.find(s => s.id === selectedSnapshot);
                  if (!snapshot) return null;

                  return (
                    <>
                      {/* Snapshot Header */}
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{snapshot.label}</h2>
                            <p className="text-gray-600">{snapshot.period.start} ~ {snapshot.period.end}</p>
                          </div>
                        </div>

                        {/* Metrics Cards */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
                            <div className="text-xs text-gray-600 mb-1">Total Fare</div>
                            <div className="text-2xl font-bold text-emerald-600">₩{(snapshot.metrics.fare / 1000000).toFixed(0)}M</div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                            <div className="text-xs text-gray-600 mb-1">Margin</div>
                            <div className="text-2xl font-bold text-blue-600">{snapshot.metrics.margin}%</div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                            <div className="text-xs text-gray-600 mb-1">Count</div>
                            <div className="text-2xl font-bold text-purple-600">{snapshot.metrics.count.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Source Files */}
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                          Data Sources ({snapshot.sources.length})
                        </h3>
                        <div className="space-y-3">
                          {snapshot.sources.map((source, idx) => (
                            <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center gap-3">
                              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                              <span className="text-sm text-gray-900">{source}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline Comparison */}
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-1 shadow-xl">
                        <div className="bg-white rounded-3xl p-8">
                          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                            Timeline Comparison
                          </h3>
                          <div className="space-y-4">
                            {snapshots.map((snap, idx) => (
                              <div key={snap.id} className={`p-4 rounded-2xl transition-all ${snap.id === selectedSnapshot
                                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300'
                                  : 'bg-gray-50'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900">{snap.label}</span>
                                  <span className="text-xs text-gray-600">{snap.period.start}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                  <div>
                                    <div className="text-gray-600">Fare</div>
                                    <div className="text-emerald-600 font-medium">₩{(snap.metrics.fare / 1000000).toFixed(0)}M</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Margin</div>
                                    <div className="text-blue-600 font-medium">{snap.metrics.margin}%</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Count</div>
                                    <div className="text-purple-600 font-medium">{snap.metrics.count.toLocaleString()}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.decision}</p>
                      </div>
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium">
                        사용 {template.usageCount}회
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          Impact Metrics
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {template.impactMetrics.map(metric => (
                            <span key={metric} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <Database className="w-4 h-4 text-purple-600" />
                          Dimensions
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {template.dimensions.map(dim => (
                            <span key={dim} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                              {dim}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                      <div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        Time Scope
                      </div>
                      <p className="text-sm text-gray-600">
                        {template.timeScope.mode === 'month_over_month'
                          ? `최근 ${template.timeScope.monthsBack}개월 비교`
                          : `과거 ${template.timeScope.monthsBack}개월 범위`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: AI Suggestions */}
          <div className="w-96 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-1 shadow-xl shadow-purple-200/50">
            <div className="bg-white rounded-3xl p-6 h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Recommendations
              </h3>

              {activeTab === 'concepts' && selectedConcept && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-gray-900">
                        이 컬럼들은 모두 <strong>가맹점/매장</strong>을 의미하는 것으로 추정됩니다.
                      </p>
                    </div>
                    <button className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-all font-medium">
                      Merchant 개념으로 확정
                    </button>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <p className="text-sm text-gray-900">
                        <strong>점포명</strong>과 <strong>지점명</strong>이 일부 불일치합니다. 매핑 확인이 필요합니다.
                      </p>
                    </div>
                    <button className="w-full mt-3 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-sm transition-all font-medium">
                      불일치 항목 보기
                    </button>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
                    <div className="flex items-start gap-2 mb-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <p className="text-sm text-gray-900">
                        총 <strong>142개</strong>의 고유한 가맹점이 식별되었습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'time' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                    <p className="text-sm text-gray-900 mb-3">
                      <strong>10월</strong>은 <strong>7월</strong> 대비:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">운임</span>
                        <span className="text-emerald-600 font-bold">+26.4% ↑</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">마진율</span>
                        <span className="text-emerald-600 font-bold">+1.9% ↑</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">건수</span>
                        <span className="text-emerald-600 font-bold">+33.9% ↑</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                    <p className="text-sm text-gray-900">
                      <strong>강남 가맹본부</strong>의 7월-10월 트렌드를 분석하시겠습니까?
                    </p>
                    <button className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-all font-medium">
                      분석 시작
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
                    <p className="text-sm text-gray-900 mb-3">
                      이 템플릿으로 <strong>Magic Editor</strong>에서 자동 분석을 실행할 수 있습니다.
                    </p>
                    <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm transition-all font-medium">
                      Magic Editor로 이동
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
