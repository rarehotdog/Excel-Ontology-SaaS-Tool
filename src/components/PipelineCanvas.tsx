import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

let id = 0;
const getId = () => `dndnode_${id++}`;

interface PipelineNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  data?: { icon: string };
}

interface PipelineConnection {
  from: string;
  to: string;
}

interface PipelineCanvasProps {
  selectedNode: string | null;
  onSelectNode: (nodeId: string | null) => void;
  pipelineData?: {
    nodes: PipelineNode[];
    connections: PipelineConnection[];
  } | null;
  onNodeDrop?: (nodeLabel: string) => void;
}

// Default nodes for empty state
const defaultNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    position: { x: 250, y: 50 },
    data: { label: '🔵 Data Source' },
    style: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: 'bold',
    }
  },
];

const defaultEdges: Edge[] = [];

function PipelineCanvasContent({
  selectedNode,
  onSelectNode,
  pipelineData,
  onNodeDrop,
}: PipelineCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);

  // Convert pipelineData to ReactFlow format
  useEffect(() => {
    if (pipelineData && pipelineData.nodes.length > 0) {
      const convertedNodes: Node[] = pipelineData.nodes.map((node) => {
        let bgColor = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        let icon = '⚙️';
        
        if (node.type === 'source') {
          bgColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          icon = '📊';
        } else if (node.type === 'output') {
          bgColor = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
          icon = '📤';
        } else if (node.type === 'transform') {
          bgColor = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
          icon = '🔄';
        }

        return {
          id: node.id,
          type: node.type === 'source' ? 'input' : node.type === 'output' ? 'output' : 'default',
          position: { x: node.x, y: node.y },
          data: { label: `${icon} ${node.label}` },
          style: {
            background: bgColor,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }
        };
      });

      const convertedEdges: Edge[] = pipelineData.connections.map((conn, idx) => ({
        id: `e-${idx}`,
        source: conn.from,
        target: conn.to,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      }));

      setNodes(convertedNodes);
      setEdges(convertedEdges);
    }
  }, [pipelineData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowWrapper.current?.getBoundingClientRect();
      if (!position) return;

      const p = project({
        x: event.clientX - position.left,
        y: event.clientY - position.top,
      });

      let bgColor = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      let icon = '⚙️';
      
      if (type === 'input') {
        bgColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        icon = '📊';
      } else if (type === 'output') {
        bgColor = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
        icon = '📤';
      }

      const newNode: Node = {
        id: getId(),
        type: type === 'input' ? 'input' : type === 'output' ? 'output' : 'default',
        position: p,
        data: { label: `${icon} ${label}` },
        style: {
          background: bgColor,
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }
      };

      setNodes((nds) => nds.concat(newNode));
      
      // 노드 드롭 시 콜백 호출 (데이터 변환 트리거)
      if (onNodeDrop && label) {
        onNodeDrop(label);
      }
    },
    [project, setNodes, onNodeDrop]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    onSelectNode(node.id);
  };

  const onPaneClick = () => {
    onSelectNode(null);
  };

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        className="bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls className="bg-white rounded-xl shadow-lg" />
        <MiniMap 
          className="bg-white rounded-xl shadow-lg"
          nodeColor={(node) => {
            if (node.type === 'input') return '#10b981';
            if (node.type === 'output') return '#f97316';
            return '#8b5cf6';
          }}
        />
      </ReactFlow>
      
      {/* Empty State Overlay */}
      {nodes.length <= 1 && !pipelineData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-white/90 backdrop-blur rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-gray-600 mb-2">자연어로 명령을 입력하거나</p>
            <p className="text-gray-600">왼쪽에서 노드를 드래그해서 추가하세요</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function PipelineCanvas(props: PipelineCanvasProps) {
  return (
    <ReactFlowProvider>
      <PipelineCanvasContent {...props} />
    </ReactFlowProvider>
  );
}
