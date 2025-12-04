from typing import List, Dict, Any, Optional
import uuid

class LineageTracker:
    def __init__(self):
        self.nodes: List[Dict[str, Any]] = []
        self.edges: List[Dict[str, Any]] = []

    def add_node(self, node_id: str, node_type: str, label: str, metadata: Dict[str, Any] = None):
        """
        Add a node to the lineage graph.
        node_type: 'source', 'transform', 'output', 'ai'
        """
        # Check if node already exists
        if any(n['id'] == node_id for n in self.nodes):
            return

        # Position logic (simple auto-layout simulation)
        # In a real app, we might use a graph layout library or let frontend handle it.
        # Here we just stagger them based on count for demo purposes.
        count = len(self.nodes)
        x = (count % 3) * 250 + 100
        y = (count // 3) * 150 + 100

        self.nodes.append({
            "id": node_id,
            "type": "custom", # We'll use a custom node type in ReactFlow
            "data": { 
                "label": label, 
                "type": node_type,
                "metadata": metadata or {} 
            },
            "position": { "x": x, "y": y }
        })

    def add_edge(self, source: str, target: str, label: str = ""):
        """
        Add an edge between two nodes.
        """
        # Check if edge already exists
        edge_id = f"e-{source}-{target}"
        if any(e['id'] == edge_id for e in self.edges):
            return

        self.edges.append({
            "id": edge_id,
            "source": source,
            "target": target,
            "label": label,
            "animated": True,
            "style": { "stroke": "#8b5cf6" }
        })

    def get_graph(self):
        """
        Return the graph in ReactFlow format.
        """
        return {
            "nodes": self.nodes,
            "edges": self.edges
        }

    def clear(self):
        self.nodes = []
        self.edges = []
