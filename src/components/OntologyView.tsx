import { useState } from 'react';
import { Network, Plus, Search, Sparkles, Zap } from 'lucide-react';

export function OntologyView() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>('project');

  const entities = [
    { id: 'project', name: 'Project', attributes: ['id', 'name', 'status', 'budget', 'start_date'], relations: ['tasks', 'team'], color: 'blue' },
    { id: 'task', name: 'Task', attributes: ['id', 'title', 'description', 'priority', 'due_date'], relations: ['project', 'assignee'], color: 'purple' },
    { id: 'user', name: 'User', attributes: ['id', 'name', 'email', 'role', 'department'], relations: ['projects', 'tasks'], color: 'pink' },
    { id: 'budget', name: 'Budget', attributes: ['id', 'amount', 'category', 'period'], relations: ['project'], color: 'emerald' },
    { id: 'report', name: 'Report', attributes: ['id', 'type', 'date', 'status'], relations: ['project'], color: 'orange' },
    { id: 'metric', name: 'Metric', attributes: ['id', 'name', 'value', 'unit'], relations: ['project', 'report'], color: 'teal' },
  ];

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="p-8 pb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                <Network className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900 mb-1">Ontology</h1>
                <p className="text-gray-600">엔티티와 관계를 정의하고 관리하세요</p>
              </div>
            </div>
            <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Plus className="w-6 h-6" />
              <span>Add Entity</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="flex gap-6">
          {/* Entity List */}
          <div className="w-96 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-purple-100/50">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search entities..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-3">
              {entities.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity.id)}
                  className={`
                    w-full text-left p-4 rounded-2xl transition-all duration-300
                    ${selectedEntity === entity.id
                      ? `bg-gradient-to-br shadow-lg scale-105 text-white
                        ${entity.color === 'blue' ? 'from-blue-400 to-blue-600 shadow-blue-200' : ''}
                        ${entity.color === 'purple' ? 'from-purple-400 to-purple-600 shadow-purple-200' : ''}
                        ${entity.color === 'pink' ? 'from-pink-400 to-pink-600 shadow-pink-200' : ''}
                        ${entity.color === 'emerald' ? 'from-emerald-400 to-emerald-600 shadow-emerald-200' : ''}
                        ${entity.color === 'orange' ? 'from-orange-400 to-orange-600 shadow-orange-200' : ''}
                        ${entity.color === 'teal' ? 'from-teal-400 to-teal-600 shadow-teal-200' : ''}`
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Network className="w-5 h-5" />
                    <span className="text-sm">{entity.name}</span>
                  </div>
                  <div className={`text-xs ${selectedEntity === entity.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {entity.attributes.length} attributes • {entity.relations.length} relations
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main View */}
          <div className="flex-1">
            {selectedEntity ? (
              <div className="space-y-6">
                {(() => {
                  const entity = entities.find(e => e.id === selectedEntity);
                  if (!entity) return null;

                  return (
                    <>
                      {/* Entity Header */}
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`
                              w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br
                              ${entity.color === 'blue' ? 'from-blue-400 to-blue-600 shadow-blue-200' : ''}
                              ${entity.color === 'purple' ? 'from-purple-400 to-purple-600 shadow-purple-200' : ''}
                              ${entity.color === 'pink' ? 'from-pink-400 to-pink-600 shadow-pink-200' : ''}
                              ${entity.color === 'emerald' ? 'from-emerald-400 to-emerald-600 shadow-emerald-200' : ''}
                              ${entity.color === 'orange' ? 'from-orange-400 to-orange-600 shadow-orange-200' : ''}
                              ${entity.color === 'teal' ? 'from-teal-400 to-teal-600 shadow-teal-200' : ''}
                            `}>
                              <Network className="w-10 h-10 text-white" />
                            </div>
                            <div>
                              <h2 className="text-3xl text-gray-900 mb-2">{entity.name}</h2>
                              <p className="text-gray-600">Core entity in the data model</p>
                            </div>
                          </div>
                          <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all hover:scale-105">
                            Edit Entity
                          </button>
                        </div>
                        <div className="flex gap-4">
                          <div className={`
                            px-6 py-3 rounded-2xl text-white shadow-lg
                            ${entity.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : ''}
                            ${entity.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : ''}
                            ${entity.color === 'pink' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : ''}
                            ${entity.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : ''}
                            ${entity.color === 'orange' ? 'bg-gradient-to-br from-orange-400 to-orange-600' : ''}
                            ${entity.color === 'teal' ? 'bg-gradient-to-br from-teal-400 to-teal-600' : ''}
                          `}>
                            {entity.attributes.length} Attributes
                          </div>
                          <div className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl">
                            {entity.relations.length} Relations
                          </div>
                        </div>
                      </div>

                      {/* Attributes */}
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            Attributes
                          </h3>
                          <button className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                            + Add Attribute
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {entity.attributes.map((attr, idx) => (
                            <div
                              key={idx}
                              className="group flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 rounded-2xl transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-sm" />
                                <span className="text-sm text-gray-900">{attr}</span>
                                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200">
                                  string
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Relations */}
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-purple-100/50">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                              <Network className="w-5 h-5 text-white" />
                            </div>
                            Relations
                          </h3>
                          <button className="text-sm text-purple-600 hover:text-purple-700 px-4 py-2 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all">
                            + Add Relation
                          </button>
                        </div>
                        <div className="space-y-3">
                          {entity.relations.map((rel, idx) => (
                            <div
                              key={idx}
                              className="group flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 rounded-2xl transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                  <Zap className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm text-gray-900">{rel}</span>
                                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200">
                                  has many
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Relationship Graph */}
                      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-1 shadow-xl shadow-purple-200/50">
                        <div className="bg-white rounded-3xl p-8">
                          <h3 className="text-xl text-gray-900 mb-6 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            Relationship Graph
                          </h3>
                          <div className="h-80 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-200 animate-pulse">
                                <Network className="w-12 h-12 text-white" />
                              </div>
                              <p className="text-gray-600">Interactive graph visualization</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Network className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Select an entity to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
