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
steep_nodes = {"B"}    # e.g., steep or inaccessible for Divyangjan/elderly
vip_priority_edges = [("A", "F"), ("F", "E")]  # VIP priority route


def compute_smart_path(start, end, user_type):
    G_smart = G.copy()
    removed_nodes = set()
    edge_weights = nx.get_edge_attributes(G_smart, 'weight')

    if user_type == "public":
        # Remove unsafe nodes for public
        G_smart.remove_nodes_from(unsafe_nodes)
        removed_nodes = unsafe_nodes
    elif user_type.lower() == "vip":
        # VIPs: prioritize certain edges by lowering their weights
        for u, v in vip_priority_edges:
            if G_smart.has_edge(u, v):
                G_smart[u][v]['weight'] = 0.5  # Lower weight for VIP priority
        G_smart.remove_nodes_from(unsafe_nodes)  # Still avoid unsafe
        removed_nodes = unsafe_nodes
    elif user_type.lower() in ["divyangjan", "elderly"]:
        # Remove unsafe and steep nodes for accessibility
        G_smart.remove_nodes_from(unsafe_nodes | steep_nodes)
        removed_nodes = unsafe_nodes | steep_nodes
    else:
        # Default: treat as public
        G_smart.remove_nodes_from(unsafe_nodes)
        removed_nodes = unsafe_nodes

    try:
        path = nx.dijkstra_path(G_smart, start, end, weight="weight")
        length = nx.dijkstra_path_length(G_smart, start, end, weight="weight")
        return {
            "start": start,
            "end": end,
            "user_type": user_type,
            "path": path,
            "total_distance": length,
            "removed_nodes": list(removed_nodes)
        }
    except nx.NetworkXNoPath:
        return {
            "start": start,
            "end": end,
            "user_type": user_type,
            "path": None,
            "message": "No safe path available for this user type.",
            "removed_nodes": list(removed_nodes)
        } 