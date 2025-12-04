import { useState } from 'react';
import { Plus, Play, Save, Sparkles, Wand2, Upload as UploadIcon, Database, Settings, Download } from 'lucide-react';
import { PipelineCanvas } from './PipelineCanvas';

export function SmartTransformView() {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [naturalLanguageInput, setNaturalLanguageInput] = useState('');

    const handleSmartBuild = () => {
        // AI가 자연어를 파이프라인으로 변환
        alert('AI가 파이프라인을 자동 생성합니다: ' + naturalLanguageInput);
    };

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="p-6 pb-0">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-purple-100/50 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Smart Transform</h1>
                                <p className="text-sm text-gray-600">AI 기반 데이터 변환 파이프라인</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <Save className="w-5 h-5" />
                                <span>Save</span>
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <Play className="w-5 h-5" />
                                <span>Run Pipeline</span>
                            </button>
                        </div>
                    </div>

                    {/* Always Visible Smart Builder Panel */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Wand2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Smart Filter</h3>
                                <p className="text-xs text-gray-600">자연어로 파이프라인을 자동 생성하세요</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <textarea
                                value={naturalLanguageInput}
                                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                                placeholder="예: '엑셀 데이터를 불러와서 진행중인 프로젝트만 필터링하고, 예산별로 그룹화한 다음 차트로 시각화해줘'"
                                className="flex-1 h-24 px-4 py-3 bg-white border-2 border-purple-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none transition-all"
                            />
                            <div className="flex flex-col gap-2 w-48">
                                <button
                                    onClick={handleSmartBuild}
                                    disabled={!naturalLanguageInput.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:scale-100 disabled:cursor-not-allowed text-sm font-bold"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>자동 생성</span>
                                </button>
                                <button className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-medium">
                                    예시 보기
                                </button>
                            </div>
                        </div>

                        {/* Quick Templates */}
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => setNaturalLanguageInput('엑셀을 불러와서 완료율 기준으로 정렬하고 상위 10개만 보여줘')}
                                className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left transition-all hover:scale-102 flex items-center gap-2"
                            >
                                <span className="text-xs font-bold text-purple-600">템플릿 1</span>
                                <span className="text-xs text-gray-700">상위 데이터 필터링</span>
                            </button>
                            <button
                                onClick={() => setNaturalLanguageInput('상태별로 그룹화하고 각 그룹의 평균 예산을 계산해줘')}
                                className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left transition-all hover:scale-102 flex items-center gap-2"
                            >
                                <span className="text-xs font-bold text-purple-600">템플릿 2</span>
                                <span className="text-xs text-gray-700">그룹별 집계</span>
                            </button>
                            <button
                                onClick={() => setNaturalLanguageInput('날짜별 트렌드를 분석하고 예측 모델을 만들어줘')}
                                className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left transition-all hover:scale-102 flex items-center gap-2"
                            >
                                <span className="text-xs font-bold text-purple-600">템플릿 3</span>
                                <span className="text-xs text-gray-700">트렌드 예측</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden gap-6 px-6 pb-6">
                {/* Sidebar - Node Library */}
                <div className="w-72 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto flex flex-col">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                                <Plus className="w-4 h-4 text-white" />
                            </div>
                            Node Library
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Input</div>
                                <div
                                    draggable
                                    onDragStart={(e) => onDragStart(e, 'input', 'Data Source')}
                                    className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
                                        <UploadIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 mb-1">Data Source</div>
                                    <div className="text-xs text-gray-600">Excel/CSV input</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Transform</div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Filter Rows', desc: '조건별 필터링', icon: '🔍', type: 'default' },
                                        { name: 'Group By', desc: '그룹화 및 집계', icon: '📊', type: 'default' },
                                        { name: 'Join Data', desc: '데이터 결합', icon: '🔗', type: 'default' },
                                        { name: 'Calculate', desc: '계산 및 수식', icon: '🧮', type: 'default' },
                                    ].map((node) => (
                                        <div
                                            key={node.name}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, node.type, node.name)}
                                            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300"
                                        >
                                            <div className="text-lg mb-2">{node.icon}</div>
                                            <div className="text-sm font-bold text-gray-900 mb-1">{node.name}</div>
                                            <div className="text-xs text-gray-600">{node.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">AI Powered</div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Natural Language', desc: '자연어 변환', icon: '✨', type: 'default' },
                                        { name: 'Smart Format', desc: '레퍼런스 기반', icon: '🎨', type: 'default' },
                                        { name: 'Auto Insight', desc: '자동 분석', icon: '💡', type: 'default' },
                                    ].map((node) => (
                                        <div
                                            key={node.name}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, node.type, node.name)}
                                            className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300 border-2 border-purple-200"
                                        >
                                            <div className="text-lg mb-2">{node.icon}</div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                                <div className="text-sm font-bold text-gray-900">{node.name}</div>
                                            </div>
                                            <div className="text-xs text-gray-600">{node.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Output</div>
                                <div
                                    draggable
                                    onDragStart={(e) => onDragStart(e, 'output', 'Export')}
                                    className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300"
                                >
                                    <div className="text-lg mb-2">📤</div>
                                    <div className="text-sm font-bold text-gray-900 mb-1">Export</div>
                                    <div className="text-xs text-gray-600">결과물 저장</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-hidden">
                    <PipelineCanvas selectedNode={selectedNode} onSelectNode={setSelectedNode} />
                </div>

                {/* Properties Panel */}
                <div className="w-80 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto">
                    <div className="p-6">
                        {selectedNode ? (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    Node Properties
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Node Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                                            placeholder="Enter name..."
                                            defaultValue={selectedNode}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white resize-none transition-all"
                                            rows={4}
                                            placeholder="Enter description..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Configuration</label>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl text-sm text-gray-600">
                                            Configure node settings here
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-500">Select a node to view properties</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
