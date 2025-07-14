import networkx as nx

# Simulate city graph
G = nx.Graph()

# Nodes represent intersections or key points
nodes = ["A", "B", "C", "D", "E", "F"]
G.add_nodes_from(nodes)

# Edges with weights (distance or risk score)
edges = [
    ("A", "B", 1), ("B", "C", 2), ("C", "D", 1),
    ("D", "E", 3), ("A", "F", 5), ("F", "E", 2),
    ("B", "F", 2)  # Alternative shortcut
]

for u, v, w in edges:
    G.add_edge(u, v, weight=w)

# Simulate blocked/unsafe nodes
unsafe_nodes = {"C"}  # e.g., due to a stampede or fire

def compute_safe_path(start, end):
    try:
        # Temporarily remove unsafe nodes
        G_safe = G.copy()
        G_safe.remove_nodes_from(unsafe_nodes)

        path = nx.dijkstra_path(G_safe, start, end, weight="weight")
        length = nx.dijkstra_path_length(G_safe, start, end, weight="weight")

        return {
            "start": start,
            "end": end,
            "path": path,
            "total_distance": length
        }
    except nx.NetworkXNoPath:
        return {
            "start": start,
            "end": end,
            "path": None,
            "message": "No safe path available."
        } 