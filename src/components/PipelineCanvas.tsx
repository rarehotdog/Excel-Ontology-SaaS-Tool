import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Filter, GitMerge, Calculator, Wand2, Download, FileSpreadsheet } from 'lucide-react';

interface PipelineCanvasProps {
  selectedNode: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

const nodeTypes = {
  // We can define custom node types here if needed, but for now we'll use default with custom styles
};

export function PipelineCanvas({ selectedNode, onSelectNode }: PipelineCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const fetchLineage = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/lineage');
      const data = await res.json();

      // Transform backend nodes to ReactFlow nodes
      const flowNodes: Node[] = data.nodes.map((n: any) => ({
        id: n.id,
        type: 'default', // Using default for simplicity, can be 'custom'
        data: {
          label: (
            <div className="flex flex-col items-center">
              <div className={`p-3 rounded-xl mb-2 shadow-md ${n.data.type === 'source' ? 'bg-emerald-100 text-emerald-600' :
                  n.data.type === 'transform' ? 'bg-blue-100 text-blue-600' :
                    n.data.type === 'output' ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                }`}>
                {n.data.type === 'source' && <Database className="w-5 h-5" />}
                {n.data.type === 'transform' && <GitMerge className="w-5 h-5" />}
                {n.data.type === 'output' && <Download className="w-5 h-5" />}
                {n.data.type === 'ai' && <Wand2 className="w-5 h-5" />}
              </div>
              <div className="font-medium text-sm text-gray-900">{n.data.label}</div>
              <div className="text-xs text-gray-500 capitalize">{n.data.type}</div>
            </div>
          ),
          originalData: n.data // Keep original data for inspector
        },
        position: n.position,
        style: {
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '10px',
          minWidth: '150px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }
      }));

      const flowEdges: Edge[] = data.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      console.error("Failed to fetch lineage:", err);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchLineage();
    // Poll every 5 seconds to update graph
    const interval = setInterval(fetchLineage, 5000);
    return () => clearInterval(interval);
  }, [fetchLineage]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    onSelectNode(node.id);
  };

  const onPaneClick = () => {
    onSelectNode(null);
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#ccc" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}