import { Upload, Wand2, Lightbulb, Database, LayoutDashboard, Network, BarChart3, Download, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'sources' | 'pipeline' | 'ontology' | 'analytics' | 'exports' | 'reconciliation' | 'smart';
  onViewChange: (view: 'dashboard' | 'sources' | 'pipeline' | 'ontology' | 'analytics' | 'exports' | 'reconciliation' | 'smart') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard', color: 'blue' },
    { id: 'sources' as const, icon: Upload, label: 'Data Sources', color: 'emerald' },
    { id: 'smart' as const, icon: Sparkles, label: 'Smart Transform', color: 'violet' }, // Added Smart Transform
    { id: 'reconciliation' as const, icon: Network, label: 'Settlement', color: 'red' },
    { id: 'pipeline' as const, icon: Wand2, label: 'Pipeline', color: 'purple' },
    { id: 'ontology' as const, icon: Network, label: 'Data Dictionary', color: 'pink' },
    { id: 'analytics' as const, icon: BarChart3, label: 'Analytics', color: 'orange' },
    { id: 'exports' as const, icon: Download, label: 'Exports', color: 'teal' },
  ];

  return (
    <div className="w-72 flex flex-col p-4 gap-3">
      {/* Logo */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl px-6 py-5 shadow-lg shadow-purple-100/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-gray-900">Excel Ontology</div>
            <div className="text-xs text-gray-500">Enterprise Edition</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                ${isActive
                  ? 'bg-white shadow-lg shadow-purple-100/50 scale-105'
                  : 'hover:bg-white/60 hover:shadow-md hover:scale-102'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                ${isActive
                  ? item.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-200' :
                    item.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200' :
                      item.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-200' :
                        item.color === 'pink' ? 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg shadow-pink-200' :
                          item.color === 'orange' ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-200' :
                            'bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-200'
                  : 'bg-gray-100 group-hover:bg-gray-200'
                }
              `}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className={`text-sm transition-colors ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg shadow-purple-200/50">
        <div className="text-sm mb-1">AI-Powered Platform</div>
        <div className="text-xs opacity-80">v1.0.0 • Enterprise</div>
      </div>
    </div>
  );
}