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