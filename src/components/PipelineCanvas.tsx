import { Database, Filter, GitMerge, Calculator, Wand2, Download } from 'lucide-react';

interface PipelineCanvasProps {
  selectedNode: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

export function PipelineCanvas({ selectedNode, onSelectNode }: PipelineCanvasProps) {
  const nodes = [
    { id: 'source-1', type: 'source', label: 'Sales Data', x: 100, y: 180, icon: Database, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-200' },
    { id: 'filter-1', type: 'transform', label: 'Filter Active', x: 320, y: 180, icon: Filter, gradient: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-200' },
    { id: 'group-1', type: 'transform', label: 'Group By Region', x: 540, y: 180, icon: GitMerge, gradient: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-200' },
    { id: 'calc-1', type: 'transform', label: 'Calculate Total', x: 760, y: 180, icon: Calculator, gradient: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-200' },
    { id: 'ai-1', type: 'ai', label: 'Format Report', x: 980, y: 180, icon: Wand2, gradient: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-200' },
    { id: 'export-1', type: 'output', label: 'Export Excel', x: 1200, y: 180, icon: Download, gradient: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-200' },
  ];

  const connections = [
    { from: 'source-1', to: 'filter-1' },
    { from: 'filter-1', to: 'group-1' },
    { from: 'group-1', to: 'calc-1' },
    { from: 'calc-1', to: 'ai-1' },
    { from: 'ai-1', to: 'export-1' },
  ];

  return (
    <div className="w-full h-full relative overflow-auto">
      {/* Dotted Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Canvas Content */}
      <div className="relative" style={{ width: '1500px', height: '800px' }}>
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '1500px', height: '800px' }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {connections.map((conn, idx) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const x1 = fromNode.x + 100;
            const y1 = fromNode.y + 40;
            const x2 = toNode.x;
            const y2 = toNode.y + 40;
            const midX = (x1 + x2) / 2;

            return (
              <g key={idx}>
                <path
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  fill="none"
                  filter="url(#glow)"
                />
                <circle cx={x2} cy={y2} r="4" fill="#ec4899" className="animate-pulse" />
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          
          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`
                absolute cursor-pointer transition-all duration-300
                ${isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'}
              `}
              style={{ left: node.x, top: node.y }}
            >
              <div className={`
                w-24 h-20 bg-gradient-to-br ${node.gradient} rounded-2xl shadow-xl ${node.shadow} flex items-center justify-center
                ${isSelected ? 'ring-4 ring-purple-300 ring-offset-4' : ''}
                transition-all duration-300
              `}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <div className="text-center mt-3">
                <div className="text-sm text-gray-700 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl shadow-md inline-block">
                  {node.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}