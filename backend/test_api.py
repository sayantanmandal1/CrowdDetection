"""
Simple test script to verify the API endpoints are working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_locations_endpoint():
    """Test the locations endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/routes/locations")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Locations endpoint working - Found {len(data['locations'])} locations")
            return True
        else:
            print(f"❌ Locations endpoint failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Locations endpoint error: {e}")
        return False

def test_route_calculation():
    """Test the route calculation endpoint"""
    try:
        payload = {
            "start_location": "main_ghat",
            "end_location": "mahakal_temple",
            "route_type": "optimal",
            "avoid_crowds": True,
            "accessible_route": False,
            "transport_mode": "walking"
        }
        
        response = requests.post(f"{BASE_URL}/routes/calculate", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Route calculation working - Found {len(data['routes'])} routes")
            print(f"   Best route: {data['routes'][0]['name']} - {data['routes'][0]['distance']} - {data['routes'][0]['duration']}")
            return True
        else:
            print(f"❌ Route calculation failed - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Route calculation error: {e}")
        return False

def test_weather_endpoint():
    """Test the weather endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/routes/weather")
        if response.status_code == 200:
            data = response.json()
            weather = data['current_weather']
            print(f"✅ Weather endpoint working - {weather['temperature']}°C, {weather['conditions']}")
            return True
        else:
            print(f"❌ Weather endpoint failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Weather endpoint error: {e}")
        return False

def test_analytics_endpoint():
    """Test the analytics endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/routes/analytics")
        if response.status_code == 200:
            data = response.json()
            stats = data['network_stats']
            print(f"✅ Analytics endpoint working - {stats['total_locations']} locations, {stats['average_crowd_density']}% avg crowd")
            return True
        else:
            print(f"❌ Analytics endpoint failed - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Analytics endpoint error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Simhastha 2028 API Endpoints...")
    print("=" * 50)
    
    tests = [
        test_locations_endpoint,
        test_route_calculation,
        test_weather_endpoint,
        test_analytics_endpoint
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"🏆 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your API is ready for the hackathon!")
    else:
        print("⚠️  Some tests failed. Check the backend server is running on port 8000.")