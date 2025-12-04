import { useState } from 'react';
import { Plus, Play, Save, Sparkles } from 'lucide-react';
import { PipelineCanvas } from './PipelineCanvas';

export function Pipeline() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">Pipeline Builder</h1>
                <input
                  type="text"
                  defaultValue="Untitled Pipeline"
                  className="text-sm text-gray-600 bg-transparent border-none outline-none focus:text-gray-900"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Save className="w-5 h-5" />
                <span>Save</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Play className="w-5 h-5" />
                <span>Run Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden gap-6 px-6 pb-6">
        {/* Sidebar - Node Library */}
        <div className="w-80 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto">
          <div className="p-6">
            <h3 className="text-lg text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              Node Library
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Input</div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm text-gray-900 mb-1">Data Source</div>
                  <div className="text-xs text-gray-600">Excel/CSV input</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Transform</div>
                <div className="space-y-3">
                  {[
                    { name: 'Filter Rows', desc: '조건별 필터링', color: 'blue' },
                    { name: 'Group By', desc: '그룹화 및 집계', color: 'blue' },
                    { name: 'Join Data', desc: '데이터 결합', color: 'blue' },
                    { name: 'Calculate', desc: '계산 및 수식', color: 'blue' },
                  ].map((node) => (
                    <div key={node.name} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300">
                      <div className="text-sm text-gray-900 mb-1">{node.name}</div>
                      <div className="text-xs text-gray-600">{node.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">AI Powered</div>
                <div className="space-y-3">
                  {[
                    { name: 'Natural Language', desc: '자연어 변환' },
                    { name: 'Smart Format', desc: '레퍼런스 기반' },
                  ].map((node) => (
                    <div key={node.name} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <div className="text-sm text-gray-900">{node.name}</div>
                      </div>
                      <div className="text-xs text-gray-600">{node.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Output</div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-md hover:shadow-lg cursor-move hover:scale-105 transition-all duration-300">
                  <div className="text-sm text-gray-900 mb-1">Export</div>
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
        <div className="w-96 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100/50 overflow-auto">
          <div className="p-6">
            {selectedNode ? (
              <div>
                <h3 className="text-lg text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  Node Properties
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Node Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                      placeholder="Enter name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Description</label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white resize-none transition-all"
                      rows={4}
                      placeholder="Enter description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Configuration</label>
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

import { Database } from 'lucide-react';
