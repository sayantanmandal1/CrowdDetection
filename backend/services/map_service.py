import osmnx as ox
import json

# Ujjain city center coordinates
UJJAIN_CENTER = (23.1765, 75.7885)
UJJAIN_DIST = 7000  # meters radius

# OSM tags for points of interest
GHAT_TAGS = {"leisure": "beach_resort", "tourism": "attraction", "waterway": "riverbank"}
SAFE_ZONE_TAGS = {"amenity": ["hospital", "police", "park", "school", "community_centre"]}
TRANSPORT_TAGS = {"amenity": ["bus_station", "taxi", "ferry_terminal"], "railway": "station"}

OSM_FILENAME = "ujjain_osm_pois.json"

def fetch_osm_pois():
    # Download OSM data for Ujjain
    G = ox.graph_from_point(UJJAIN_CENTER, dist=UJJAIN_DIST, network_type='walk')
    pois = ox.features_from_point(UJJAIN_CENTER, tags={**GHAT_TAGS, **SAFE_ZONE_TAGS, **TRANSPORT_TAGS}, dist=UJJAIN_DIST)

    def extract_features(tags):
        features = []
        for idx, row in pois.iterrows():
            for k, v in tags.items():
                if k in row and (row[k] == v or (isinstance(v, list) and row[k] in v)):
                    features.append({
                        "name": row.get("name", str(idx)),
                        "type": v if isinstance(v, str) else row[k],
                        "lat": row.geometry.centroid.y if hasattr(row.geometry, 'centroid') else row.geometry.y,
                        "lon": row.geometry.centroid.x if hasattr(row.geometry, 'centroid') else row.geometry.x
                    })
        return features

    ghats = extract_features(GHAT_TAGS)
    safe_zones = extract_features(SAFE_ZONE_TAGS)
    transport_hubs = extract_features(TRANSPORT_TAGS)

    data = {
        "ghats": ghats,
        "safe_zones": safe_zones,
        "transport_hubs": transport_hubs
    }
    with open(OSM_FILENAME, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return data

# Utility to load processed POIs
def load_osm_pois():
    with open(OSM_FILENAME, "r", encoding="utf-8") as f:
        return json.load(f)

def get_geojson_map():
    """
    Return static or generated GeoJSON for zones:
    - Safe zones
    - Critical crowd hotspots
    - Emergency facilities
    - Accessible zones
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Ghat 1",
                    "type": "critical_zone",
                    "accessible": True
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[75.857, 22.717], [75.858, 22.717], [75.858, 22.718], [75.857, 22.718], [75.857, 22.717]]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Emergency Tent",
                    "type": "emergency",
                    "accessible": True
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [75.8575, 22.7175]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Toilet Cluster A",
                    "type": "sanitation",
                    "accessible": False
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [75.859, 22.716]
                }
            }
        ]
    }

def get_accessible_facilities():
    """
    Return GeoJSON for accessible facilities/zones only
    """
    all_features = get_geojson_map()["features"]
    accessible = [f for f in all_features if f["properties"].get("accessible")]
    return {"type": "FeatureCollection", "features": accessible}

def get_public_transport():
    """
    Return GeoJSON for public transport stops (bus, train, etc.)
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Bus Stop 1", "type": "bus_stop"},
                "geometry": {"type": "Point", "coordinates": [75.860, 22.718]}
            },
            {
                "type": "Feature",
                "properties": {"name": "Train Station", "type": "train_station"},
                "geometry": {"type": "Point", "coordinates": [75.855, 22.720]}
            }
        ]
    }

def get_shuttles():
    """
    Return GeoJSON for shuttle routes
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Shuttle Route 1", "type": "shuttle_route"},
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [75.860, 22.718],
                        [75.858, 22.717],
                        [75.857, 22.717],
                        [75.855, 22.720]
                    ]
                }
            }
        ]
    }

def get_live_vehicles():
    """
    Return GeoJSON for live vehicle locations (buses, shuttles)
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Shuttle 1", "type": "shuttle", "status": "en route"},
                "geometry": {"type": "Point", "coordinates": [75.858, 22.7175]}
            },
            {
                "type": "Feature",
                "properties": {"name": "Bus 1", "type": "bus", "status": "at stop"},
                "geometry": {"type": "Point", "coordinates": [75.860, 22.718]}
            }
        ]
    } 