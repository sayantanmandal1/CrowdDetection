def get_geojson_map():
    """
    Return static or generated GeoJSON for zones:
    - Safe zones
    - Critical crowd hotspots
    - Emergency facilities
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Ghat 1",
                    "type": "critical_zone"
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
                    "type": "emergency"
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
                    "type": "sanitation"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [75.859, 22.716]
                }
            }
        ]
    } 