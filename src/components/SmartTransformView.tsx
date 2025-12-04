import { useEffect, useState } from 'react';
import { Plus, Play, Save, Sparkles, Wand2, Upload as UploadIcon } from 'lucide-react';
import { PipelineCanvas } from './PipelineCanvas';
import { DataPreview } from './smart-transform/DataPreview';

export function SmartTransformView() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [outputFilename, setOutputFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const response = await fetch('http://localhost:8000/data/list');
        if (response.ok) {
          const data = await response.json();
          const mappedSources = data.map((file: any, index: number) => ({
            id: index,
            name: file.filename,
            type: file.filename.endsWith('.csv') ? 'CSV' : 'Excel',
            rows: file.shape[0],
          }));
          setSources(mappedSources);
          if (mappedSources.length > 0 && !selectedFile) {
            setSelectedFile(mappedSources[0].name);
          }
        }
      } catch (e) {
        console.error('Failed to fetch data sources for Smart Transform:', e);
      }
    };

    fetchDataSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSmartBuild = async () => {
    if (!naturalLanguageInput.trim()) return;
    if (!selectedFile) {
      alert('먼저 변환할 파일을 선택해 주세요.');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/smart-transform/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: naturalLanguageInput,
          filename: selectedFile,
        }),
      });

      if (!response.ok) {
        let message = 'Smart transform failed';
        try {
          const text = await response.text();
          if (text) {
            try {
              const parsed = JSON.parse(text);
              message =
                parsed?.detail ||
                parsed?.message ||
                (typeof parsed === 'object' ? JSON.stringify(parsed) : parsed) ||
                message;
            } catch {
              message = text;
            }
          }
        } catch {
          // ignore parsing errors and keep default message
        }

        if (message.includes('File not found')) {
          message =
            '서버에서 선택한 파일을 찾을 수 없습니다. 서버를 다시 켠 경우 Data Sources 탭에서 파일을 다시 업로드한 뒤 시도해 주세요.';
        }

        throw new Error(message);
      }

      const result = await response.json();
      setPreviewData(result.previewData || []);
      setOutputFilename(result.outputFilename || null);
    } catch (e: any) {
      console.error('Smart transform error:', e);
      setError(e?.message || '스마트 변환에 실패했습니다. 다시 시도해 주세요.');
      setPreviewData(null);
      setOutputFilename(null);
    } finally {
      setIsRunning(false);
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleRunPipeline = async () => {
    if (!outputFilename) {
      alert('먼저 Smart Filter에서 AI 변환을 실행해 주세요.');
      return;
    }

    try {
      setIsExporting(true);
      const url = `http://localhost:8000/export/download?filename=${encodeURIComponent(
        outputFilename,
      )}&format=excel`;
      // 새 탭/창으로 다운로드 트리거
      window.open(url, '_blank');
    } finally {
      setIsExporting(false);
    }
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
              <button
                onClick={handleRunPipeline}
                disabled={!outputFilename || isExporting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>내보내는 중...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Run Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Smart Builder Panel */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 max-h-[600px] overflow-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Smart Filter</h3>
                <p className="text-xs text-gray-600">자연어로 파이프라인을 자동 생성하세요</p>
              </div>
            </div>

            {/* Smart Filter body */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <textarea
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  placeholder="예: '엑셀 데이터를 불러와서 진행중인 프로젝트만 필터링하고, 예산별로 그룹화한 다음 차트로 시각화해줘'"
                  className="flex-1 h-24 px-4 py-3 bg-white border-2 border-purple-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none transition-all"
                />
                <div className="flex flex-col gap-2 w-52">
                  <select
                    value={selectedFile || ''}
                    onChange={(e) => setSelectedFile(e.target.value || null)}
                    className="px-3 py-2 bg-white border-2 border-purple-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-purple-400"
                  >
                    <option value="">대상 파일 선택</option>
                    {sources.map((source) => (
                      <option key={source.id} value={source.name}>
                        {source.name} ({source.rows.toLocaleString()} rows)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSmartBuild}
                    disabled={!naturalLanguageInput.trim() || !selectedFile || isRunning}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:scale-100 disabled:cursor-not-allowed text-sm font-bold"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>스마트 변환 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>AI 변환 실행</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Templates */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    setNaturalLanguageInput(
                      '엑셀을 불러와서 완료율 기준으로 정렬하고 상위 10개만 보여줘',
                    )
                  }
                  className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left transition-all hover:scale-102 flex items-center gap-2"
                >
                  <span className="text-xs font-bold text-purple-600">템플릿 1</span>
                  <span className="text-xs text-gray-700">상위 데이터 필터링</span>
                </button>
                <button
                  onClick={() =>
                    setNaturalLanguageInput(
                      '상태별로 그룹화하고 각 그룹의 평균 예산을 계산해줘',
                    )
                  }
                  className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left transition-all hover:scale-102 flex items-center gap-2"
                >
                  <span className="text-xs font-bold text-purple-600">템플릿 2</span>
                  <span className="text-xs text-gray-700">그룹별 집계</span>
                </button>
                <button
                  onClick={() =>
                    setNaturalLanguageInput(
                      '날짜별 트렌드를 분석하고 예측 모델을 만들어줘',
                    )
                  }
                  className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left transition-all hover:scale-102 flex items-center gap-2"
                >
                  <span className="text-xs font-bold text-purple-600">템플릿 3</span>
                  <span className="text-xs text-gray-700">트렌드 예측</span>
                </button>
              </div>

              {/* Result / Error */}
              {((previewData && previewData.length > 0) || error) && (
                <div className="mt-4 bg-white rounded-2xl border border-purple-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-purple-700">
                      {outputFilename ? `변환 미리보기: ${outputFilename}` : '변환 미리보기'}
                    </div>
                  </div>
                  {error ? (
                    <div className="text-sm text-red-500">{error}</div>
                  ) : (
                    <div className="mt-1 max-h-80 overflow-auto -mr-1 pr-1">
                      <DataPreview data={previewData || []} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lower area (Node Library + Canvas + Properties)
          - 전체 높이를 최대 1000px로 제한
          - 각 영역(좌/중/우) 내부에서 개별 스크롤 처리 */}
      <div className="flex-1 min-h-0 flex gap-6 px-6 pb-6 mt-4 h-[1000px] max-h-[1000px] overflow-hidden">
        {/* Sidebar - Node Library */}
        <div className="w-72 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              Node Library
            </h3>

            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  Input
                </div>
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
                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  Transform
                </div>
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
                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  AI Powered
                </div>
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
                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  Output
                </div>
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

        {/* Canvas 영역
            - 흰색 카드 전체가 하단 영역 높이를 따르고
            - 내부 ReactFlow 캔버스가 그 안에서 스크롤/패닝 처리 */}
        <div className="flex-1 h-full min-h-0 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0">
            <PipelineCanvas selectedNode={selectedNode} onSelectNode={setSelectedNode} />
          </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Node Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                      placeholder="Enter name..."
                      defaultValue={selectedNode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white resize-none transition-all"
                      rows={4}
                      placeholder="Enter description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuration
                    </label>
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
