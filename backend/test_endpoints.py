#!/usr/bin/env python3
"""
Comprehensive endpoint testing for AI-Powered Smart Mobility Platform
Tests all API endpoints to ensure they're working correctly
"""

import asyncio
import aiohttp
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def test_endpoint(session, endpoint, method="GET", data=None):
    """Test a single endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        if method == "GET":
            async with session.get(url) as response:
                status = response.status
                if status == 200:
                    result = await response.json()
                    return {"endpoint": endpoint, "status": "✅ SUCCESS", "code": status, "data_keys": list(result.keys()) if isinstance(result, dict) else "non-dict"}
                else:
                    return {"endpoint": endpoint, "status": "❌ FAILED", "code": status, "error": await response.text()}
        elif method == "POST":
            async with session.post(url, json=data) as response:
                status = response.status
                if status == 200:
                    result = await response.json()
                    return {"endpoint": endpoint, "status": "✅ SUCCESS", "code": status, "data_keys": list(result.keys()) if isinstance(result, dict) else "non-dict"}
                else:
                    return {"endpoint": endpoint, "status": "❌ FAILED", "code": status, "error": await response.text()}
    except Exception as e:
        return {"endpoint": endpoint, "status": "💥 ERROR", "error": str(e)}

async def run_comprehensive_tests():
    """Run comprehensive tests on all endpoints"""
    
    print("🚀 AI-Powered Smart Mobility Platform - Endpoint Testing")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        
        # Health Check Endpoints
        print("\n🏥 HEALTH CHECK ENDPOINTS")
        print("-" * 30)
        health_endpoints = [
            "/",
            "/health"
        ]
        
        for endpoint in health_endpoints:
            result = await test_endpoint(session, endpoint)
            print(f"{result['status']} {endpoint} (HTTP {result.get('code', 'N/A')})")
        
        # Crowd Detection Endpoints
        print("\n👥 CROWD DETECTION ENDPOINTS")
        print("-" * 30)
        crowd_endpoints = [
            "/crowd/analytics",
            "/crowd/heatmap",
            "/crowd/predictions",
            "/crowd/flow-analysis",
            "/crowd/demographics"
        ]
        
        for endpoint in crowd_endpoints:
            result = await test_endpoint(session, endpoint)
            print(f"{result['status']} {endpoint} (HTTP {result.get('code', 'N/A')})")
            if result['status'] == "✅ SUCCESS" and 'data_keys' in result:
                print(f"    📊 Data keys: {result['data_keys']}")
        
        # Alert System Endpoints
        print("\n🚨 ALERT SYSTEM ENDPOINTS")
        print("-" * 30)
        alert_endpoints = [
            "/alerts/current",
            "/alerts/emergency",
            "/alerts/predictions",
            "/alerts/statistics"
        ]
        
        for endpoint in alert_endpoints:
            result = await test_endpoint(session, endpoint)
            print(f"{result['status']} {endpoint} (HTTP {result.get('code', 'N/A')})")
            if result['status'] == "✅ SUCCESS" and 'data_keys' in result:
                print(f"    📊 Data keys: {result['data_keys']}")
        
        # Routing & Navigation Endpoints
        print("\n🗺️ ROUTING & NAVIGATION ENDPOINTS")
        print("-" * 30)
        routing_endpoints = [
            "/routes/locations",
            "/routes/weather",
            "/routes/analytics",
            "/routes/crowd-data"
        ]
        
        for endpoint in routing_endpoints:
            result = await test_endpoint(session, endpoint)
            print(f"{result['status']} {endpoint} (HTTP {result.get('code', 'N/A')})")
            if result['status'] == "✅ SUCCESS" and 'data_keys' in result:
                print(f"    📊 Data keys: {result['data_keys']}")
        
        # Transport Integration Endpoints
        print("\n🚌 TRANSPORT INTEGRATION ENDPOINTS")
        print("-" * 30)
        transport_endpoints = [
            "/transport/hubs",
            "/routes/transport/hubs"  # Both should work now
        ]
        
        for endpoint in transport_endpoints:
            result = await test_endpoint(session, endpoint)
            print(f"{result['status']} {endpoint} (HTTP {result.get('code', 'N/A')})")
            if result['status'] == "✅ SUCCESS" and 'data_keys' in result:
                print(f"    📊 Data keys: {result['data_keys']}")
        
        # Infrastructure Endpoints
        print("\n🏗️ INFRASTRUCTURE ENDPOINTS")
        print("-" * 30)
        infrastructure_endpoints = [
            "/infrastructure/accessible",
            "/infrastructure/signage",
            "/routes/infrastructure/accessible",
            "/routes/infrastructure/signage"
        ]
        
        for endpoint in infrastructure_endpoints:
            result = await test_endpoint(session, endpoint)
            print(f"{result['status']} {endpoint} (HTTP {result.get('code', 'N/A')})")
            if result['status'] == "✅ SUCCESS" and 'data_keys' in result:
                print(f"    📊 Data keys: {result['data_keys']}")
        
        # VIP Services
        print("\n👑 VIP SERVICES ENDPOINTS")
        print("-" * 30)
        vip_endpoints = [
            "/routes/routes/vip"
        ]
        
        for endpoint in vip_endpoints:
            result = await test_endpoint(session, endpoint)
            print(f"{result['status']} {endpoint} (HTTP {result.get('code', 'N/A')})")
        
        # AI Route Calculation (POST)
        print("\n🤖 AI ROUTE CALCULATION ENDPOINTS")
        print("-" * 30)
        
        # Test route calculation
        route_data = {
            "start_location": "ram_ghat_main",
            "end_location": "mahakal_temple",
            "route_type": "optimal",
            "avoid_crowds": True,
            "accessible_route": False,
            "transport_mode": "walking",
            "user_type": "general"
        }
        
        result = await test_endpoint(session, "/routes/calculate", "POST", route_data)
        print(f"{result['status']} /routes/calculate (POST) (HTTP {result.get('code', 'N/A')})")
        if result['status'] == "✅ SUCCESS" and 'data_keys' in result:
            print(f"    📊 Data keys: {result['data_keys']}")
        
        # Test nearby locations
        result = await test_endpoint(session, "/routes/nearby?lat=23.1765&lng=75.7885&limit=5")
        print(f"{result['status']} /routes/nearby (HTTP {result.get('code', 'N/A')})")
        
        print("\n" + "=" * 60)
        print("🎯 ENDPOINT TESTING COMPLETE")
        print("=" * 60)

if __name__ == "__main__":
    print("Starting comprehensive endpoint testing...")
    print("Make sure the backend server is running on http://localhost:8000")
    print()
    
    try:
        asyncio.run(run_comprehensive_tests())
    except KeyboardInterrupt:
        print("\n⚠️ Testing interrupted by user")
    except Exception as e:
        print(f"\n💥 Testing failed with error: {e}")