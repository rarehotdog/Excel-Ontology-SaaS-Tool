import { useState, useCallback } from 'react';
import { Plus, Play, Save, Sparkles, Wand2, Upload as UploadIcon, Filter, ArrowUpDown, TableProperties, Link, Calculator as CalcIcon, ChevronDown, ChevronUp, GripVertical, Database, GitMerge, Calculator, Download } from 'lucide-react';
import { PipelineCanvas } from './PipelineCanvas';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from 'reactflow';

// Simulation Logic
const simulateAIAnalysis = (prompt: string) => {
  const keywords = prompt.toLowerCase();

  const nodes: Node[] = [
    { id: 'source-1', type: 'input', position: { x: 100, y: 180 }, data: { label: 'Sales Data', icon: 'Database' } }
  ];
  const edges: Edge[] = [];
  let lastId = 'source-1';
  let currentX = 320;

  if (keywords.includes("필터") || keywords.includes("filter")) {
    nodes.push({ id: 'filter-1', type: 'default', position: { x: currentX, y: 180 }, data: { label: 'Filter Rows', icon: 'Filter' } });
    edges.push({ id: `e-${lastId}-filter-1`, source: lastId, target: 'filter-1', animated: true });
    lastId = 'filter-1';
    currentX += 220;
  }

  if (keywords.includes("정렬") || keywords.includes("sort")) {
    nodes.push({ id: 'sort-1', type: 'default', position: { x: currentX, y: 180 }, data: { label: 'Sort Data', icon: 'ArrowUpDown' } });
    edges.push({ id: `e-${lastId}-sort-1`, source: lastId, target: 'sort-1', animated: true });
    lastId = 'sort-1';
    currentX += 220;
  }

  if (keywords.includes("그룹") || keywords.includes("group") || keywords.includes("피벗")) {
    nodes.push({ id: 'group-1', type: 'default', position: { x: currentX, y: 180 }, data: { label: 'Pivot / Group', icon: 'TableProperties' } });
    edges.push({ id: `e-${lastId}-group-1`, source: lastId, target: 'group-1', animated: true });
    lastId = 'group-1';
    currentX += 220;
  }

  if (keywords.includes("계산") || keywords.includes("calculate") || keywords.includes("평균") || keywords.includes("합계")) {
    nodes.push({ id: 'calc-1', type: 'default', position: { x: currentX, y: 180 }, data: { label: 'Calculate', icon: 'Calculator' } });
    edges.push({ id: `e-${lastId}-calc-1`, source: lastId, target: 'calc-1', animated: true });
    lastId = 'calc-1';
    currentX += 220;
  }

  // AI Node
  nodes.push({ id: 'ai-1', type: 'default', position: { x: currentX, y: 180 }, data: { label: 'AI Analysis', icon: 'Wand2' } });
  edges.push({ id: `e-${lastId}-ai-1`, source: lastId, target: 'ai-1', animated: true });
  lastId = 'ai-1';
  currentX += 220;

  // Output Node
  nodes.push({ id: 'export-1', type: 'output', position: { x: currentX, y: 180 }, data: { label: 'Export Excel', icon: 'Download' } });
  edges.push({ id: `e-${lastId}-export-1`, source: lastId, target: 'export-1', animated: true });

  return { nodes, edges };
};

const initialNodes: Node[] = [
  { id: 'source-1', type: 'input', position: { x: 100, y: 180 }, data: { label: 'Sales Data', icon: 'Database' } },
  { id: 'filter-1', type: 'default', position: { x: 320, y: 180 }, data: { label: 'Filter Active', icon: 'Filter' } },
  { id: 'group-1', type: 'default', position: { x: 540, y: 180 }, data: { label: 'Group By Region', icon: 'GitMerge' } },
  { id: 'calc-1', type: 'default', position: { x: 760, y: 180 }, data: { label: 'Calculate Total', icon: 'Calculator' } },
  { id: 'ai-1', type: 'default', position: { x: 980, y: 180 }, data: { label: 'Format Report', icon: 'Wand2' } },
  { id: 'export-1', type: 'output', position: { x: 1200, y: 180 }, data: { label: 'Export Excel', icon: 'Download' } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'source-1', target: 'filter-1', animated: true },
  { id: 'e2', source: 'filter-1', target: 'group-1', animated: true },
  { id: 'e3', source: 'group-1', target: 'calc-1', animated: true },
  { id: 'e4', source: 'calc-1', target: 'ai-1', animated: true },
  { id: 'e5', source: 'ai-1', target: 'export-1', animated: true },
];

export function Pipeline() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [aiBuilderCollapsed, setAiBuilderCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onAddNode = useCallback((node: Node) => {
    setNodes((nds) => nds.concat(node));
  }, [setNodes]);

  const handleSmartBuild = () => {
    if (!naturalLanguageInput.trim()) return;
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const result = simulateAIAnalysis(naturalLanguageInput);
      setNodes(result.nodes);
      setEdges(result.edges);
      setIsGenerating(false);
    }, 1500);
  };

  const onDragStart = (event: React.DragEvent, type: string, label: string, icon: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.setData('application/icon', icon);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-purple-100/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">Smart Transform</h1>
                <input
                  type="text"
                  defaultValue="Untitled Transform"
                  className="text-sm text-gray-600 bg-transparent border-none outline-none focus:text-gray-900"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Save className="w-5 h-5" />
                <span>Save</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Play className="w-5 h-5" />
                <span>Run Transform</span>
              </button>
            </div>
          </div>

          {/* AI Builder Panel - Always visible at top */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900">AI Smart Transform</h3>
                  <p className="text-sm text-gray-600">자연어로 데이터 변환을 자동 생성하세요</p>
                </div>
              </div>
              <button
                onClick={() => setAiBuilderCollapsed(!aiBuilderCollapsed)}
                className="p-2 hover:bg-purple-100 rounded-lg transition-all"
              >
                {aiBuilderCollapsed ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronUp className="w-5 h-5 text-gray-600" />}
              </button>
            </div>

            {!aiBuilderCollapsed && (
              <div className="animate-slide-down">
                <textarea
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  placeholder="예: '엑셀 데이터를 불러와서 진행중인 프로젝트만 필터링하고, 예산별로 그룹화한 다음 차트로 시각화해줘'"
                  className="w-full h-32 px-4 py-3 bg-white border-2 border-purple-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none transition-all mb-4"
                />

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={handleSmartBuild}
                    disabled={!naturalLanguageInput.trim() || isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>생성 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>자동 생성</span>
                      </>
                    )}
                  </button>
                  <button className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-all">
                    예시 보기
                  </button>
                </div>

                {/* Quick Templates */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setNaturalLanguageInput('엑셀을 불러와서 완료율 기준으로 정렬하고 상위 10개만 보여줘')}
                    className="p-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-left transition-all hover:scale-102"
                  >
                    <div className="text-xs text-purple-600 mb-1">템플릿 1</div>
                    <div className="text-xs text-gray-700">상위 데이터 필터링</div>
                  </button>
                  <button
                    onClick={() => setNaturalLanguageInput('상태별로 그룹화하고 각 그룹의 평균 예산을 계산해줘')}
                    className="p-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-left transition-all hover:scale-102"
                  >
                    <div className="text-xs text-purple-600 mb-1">템플릿 2</div>
                    <div className="text-xs text-gray-700">그룹별 집계</div>
                  </button>
                  <button
                    onClick={() => setNaturalLanguageInput('날짜별 트렌드를 분석하고 예측 모델을 만들어줘')}
                    className="p-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-left transition-all hover:scale-102"
                  >
                    <div className="text-xs text-purple-600 mb-1">템플릿 3</div>
                    <div className="text-xs text-gray-700">트렌드 예측</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden gap-6 px-6 pb-6 pt-6">
        {/* Sidebar - Excel Functions */}
        <div className="w-80 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TableProperties className="w-4 h-4 text-white" />
                </div>
                Excel 기능
              </h3>
              <p className="text-xs text-gray-600">드래그하여 캔버스에 추가하세요</p>
            </div>

            <div className="space-y-6">
              {/* Data Input */}
              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  데이터 입력
                </div>
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, 'input', 'Data Source', 'Database')}
                  className="group p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl shadow-md hover:shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <GripVertical className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <UploadIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">데이터 불러오기</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Excel/CSV 파일 입력</div>
                </div>
              </div>

              {/* Data Processing */}
              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  데이터 처리
                </div>
                <div className="space-y-3">
                  {[
                    { name: '필터', desc: '조건별 행 필터링', icon: 'Filter', iconComp: Filter, color: 'blue' },
                    { name: '정렬', desc: '오름차순/내림차순', icon: 'ArrowUpDown', iconComp: ArrowUpDown, color: 'blue' },
                    { name: '피벗 테이블', desc: '데이터 요약 및 집계', icon: 'TableProperties', iconComp: TableProperties, color: 'blue' },
                    { name: 'VLOOKUP', desc: '데이터 조회 및 결합', icon: 'Link', iconComp: Link, color: 'blue' },
                  ].map((func) => {
                    const Icon = func.iconComp;
                    return (
                      <div
                        key={func.name}
                        draggable
                        onDragStart={(e) => onDragStart(e, 'default', func.name, func.icon)}
                        className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl shadow-md hover:shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-sm text-gray-900">{func.name}</div>
                        </div>
                        <div className="text-xs text-gray-600 ml-10">{func.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calculations */}
              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  계산 및 수식
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'SUM/합계', desc: '합계 계산', emoji: '➕', icon: 'Calculator' },
                    { name: 'AVERAGE/평균', desc: '평균 계산', emoji: '📊', icon: 'Calculator' },
                    { name: 'COUNT/개수', desc: '개수 세기', emoji: '#️⃣', icon: 'Calculator' },
                    { name: 'IF 조건문', desc: '조건부 계산', emoji: '🔀', icon: 'Calculator' },
                  ].map((func) => (
                    <div
                      key={func.name}
                      draggable
                      onDragStart={(e) => onDragStart(e, 'default', func.name, func.icon)}
                      className="group p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl shadow-md hover:shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="w-4 h-4 text-orange-400 group-hover:text-orange-600" />
                        <div className="text-lg">{func.emoji}</div>
                        <div className="text-sm text-gray-900">{func.name}</div>
                      </div>
                      <div className="text-xs text-gray-600 ml-10">{func.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Functions */}
              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  AI 기능
                </div>
                <div className="space-y-3">
                  {[
                    { name: '스마트 포맷', desc: '레퍼런스 기반 양식', emoji: '🎨', icon: 'Wand2' },
                    { name: '자동 분석', desc: 'AI 인사이트 생성', emoji: '💡', icon: 'Wand2' },
                    { name: '예측 모델', desc: '트렌드 예측', emoji: '📈', icon: 'Wand2' },
                  ].map((func) => (
                    <div
                      key={func.name}
                      draggable
                      onDragStart={(e) => onDragStart(e, 'default', func.name, func.icon)}
                      className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl shadow-md hover:shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <div className="text-sm text-gray-900">{func.name}</div>
                      </div>
                      <div className="text-xs text-gray-600 ml-10">{func.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  결과 출력
                </div>
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, 'output', '내보내기', 'Download')}
                  className="group p-4 bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-2xl shadow-md hover:shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-teal-400 group-hover:text-teal-600" />
                    <div className="text-lg">📤</div>
                    <div className="text-sm text-gray-900">내보내기</div>
                  </div>
                  <div className="text-xs text-gray-600 ml-10">Excel/CSV로 저장</div>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <GripVertical className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-900 mb-1">사용 방법:</div>
                  원하는 기능을 캔버스로 드래그하여 파이프라인을 구성하세요
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-hidden">
          <PipelineCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onAddNode={onAddNode}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />
        </div>

        {/* Properties Panel */}
        <div className="w-96 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto">
          <div className="p-6">
            {selectedNode ? (
              <div>
                <h3 className="text-lg text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  속성 설정
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">기능 이름</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                      placeholder="이름 입력..."
                      defaultValue={nodes.find(n => n.id === selectedNode)?.data.label || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">설명</label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white resize-none transition-all"
                      rows={4}
                      placeholder="설명 입력..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">설정</label>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl text-sm text-gray-600">
                      기능별 설정을 여기서 구성합니다
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500">기능을 선택하면 속성을 설정할 수 있습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
