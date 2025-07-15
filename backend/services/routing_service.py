import networkx as nx
import osmnx as ox
from services.map_service import load_osm_pois, UJJAIN_CENTER, UJJAIN_DIST

# Load real POIs
POIS = load_osm_pois()

# Build real street network graph for Ujjain
G = ox.graph_from_point(UJJAIN_CENTER, dist=UJJAIN_DIST, network_type='walk')

# Helper: get nearest node to a lat/lon
get_nearest_node = lambda lat, lon: ox.nearest_nodes(G, lon, lat)

# Helper: flatten all POIs to a list of dicts with type
ALL_LOCATIONS = []
for t in ["ghats", "safe_zones", "transport_hubs"]:
    for loc in POIS.get(t, []):
        loc["category"] = t
        ALL_LOCATIONS.append(loc)

# Helper: get location by name
def get_location_by_name(name):
    for loc in ALL_LOCATIONS:
        if loc["name"].lower() == name.lower():
            return loc
    return None

# Example: mark some nodes as unsafe/steep for demo (in real use, use live data)
unsafe_nodes = set()
steep_nodes = set()
for loc in ALL_LOCATIONS:
    if "hospital" in loc["name"].lower():
        steep_nodes.add(get_nearest_node(loc["lat"], loc["lon"]))
    if "police" in loc["name"].lower():
        unsafe_nodes.add(get_nearest_node(loc["lat"], loc["lon"]))

vip_priority_edges = []  # Could be set based on event config

def compute_smart_path(start, end, user_type):
    # Accept start/end as names or coordinates
    if isinstance(start, dict):
        start_lat, start_lon = start["lat"], start["lon"]
    else:
        loc = get_location_by_name(start)
        if not loc:
            return {"error": f"Start location '{start}' not found."}
        start_lat, start_lon = loc["lat"], loc["lon"]
    if isinstance(end, dict):
        end_lat, end_lon = end["lat"], end["lon"]
    else:
        loc = get_location_by_name(end)
        if not loc:
            return {"error": f"End location '{end}' not found."}
        end_lat, end_lon = loc["lat"], loc["lon"]

    start_node = get_nearest_node(start_lat, start_lon)
    end_node = get_nearest_node(end_lat, end_lon)

    G_smart = G.copy()
    removed_nodes = set()

    if user_type == "public":
        G_smart.remove_nodes_from(unsafe_nodes)
        removed_nodes = unsafe_nodes
    elif user_type.lower() == "vip":
        # VIPs: prioritize certain edges (not implemented in this demo)
        G_smart.remove_nodes_from(unsafe_nodes)
        removed_nodes = unsafe_nodes
    elif user_type.lower() in ["divyangjan", "elderly"]:
        G_smart.remove_nodes_from(unsafe_nodes | steep_nodes)
        removed_nodes = unsafe_nodes | steep_nodes
    else:
        G_smart.remove_nodes_from(unsafe_nodes)
        removed_nodes = unsafe_nodes

    try:
        path_nodes = nx.shortest_path(G_smart, start_node, end_node, weight="length")
        path_coords = [(G.nodes[n]["y"], G.nodes[n]["x"]) for n in path_nodes]
        total_distance = sum(
            G.edges[path_nodes[i], path_nodes[i+1], 0]["length"]
            for i in range(len(path_nodes)-1)
        )
        return {
            "start": {"lat": start_lat, "lon": start_lon},
            "end": {"lat": end_lat, "lon": end_lon},
            "user_type": user_type,
            "path": path_coords,
            "total_distance_m": total_distance,
            "removed_nodes": list(removed_nodes)
        }
    except Exception as e:
        return {
            "start": {"lat": start_lat, "lon": start_lon},
            "end": {"lat": end_lat, "lon": end_lon},
            "user_type": user_type,
            "path": None,
            "message": f"No safe path available: {str(e)}",
            "removed_nodes": list(removed_nodes)
        } 