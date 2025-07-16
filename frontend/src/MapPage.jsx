import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Navigation, 
  Shield, 
  Bus, 
  AlertTriangle, 
  Crown,
  Settings,
  BarChart3,
  Users,
  MapPin,
  Zap,
  Home,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  Bell,
  Activity,
  Layers,
  Target,
  Star,
  Volume2,
  VolumeX
} from "lucide-react";
import MapView from "./components/MapView";
import RoutePlanner from "./components/RoutePlanner";
import AlertsPanel from "./components/AlertsPanel";
import StatsPanel from "./components/StatsPanel";
import SettingsPanel from "./components/SettingsPanel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function MapPage() {
  // Current location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);
  const [showAccessible, setShowAccessible] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showVIP, setShowVIP] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activePanel, setActivePanel] = useState('route');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const panels = [
    { id: 'route', label: 'Route Planner', icon: Navigation },
    { id: 'alerts', label: 'Safety Alerts', icon: Shield },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const overlayButtons = [
    { 
      id: 'accessible', 
      label: 'Accessibility', 
      icon: Users, 
      active: showAccessible, 
      toggle: () => setShowAccessible(v => !v),
      color: '#43e97b'
    },
    { 
      id: 'transport', 
      label: 'Transport', 
      icon: Bus, 
      active: showTransport, 
      toggle: () => setShowTransport(v => !v),
      color: '#4facfe'
    },
    { 
      id: 'alerts', 
      label: 'Live Alerts', 
      icon: AlertTriangle, 
      active: showAlerts, 
      toggle: () => setShowAlerts(v => !v),
      color: '#f5576c'
    },
    { 
      id: 'vip', 
      label: 'VIP Routes', 
      icon: Crown, 
      active: showVIP, 
      toggle: () => setShowVIP(v => !v),
      color: '#ffd700'
    }
  ];

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Fetch real-time alerts from sophisticated backend
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:8000/alerts/current');
        if (response.ok) {
          const data = await response.json();
          if (data.alerts && data.alerts.length > 0) {
            const formattedNotifications = data.alerts.slice(0, 6).map(alert => ({
              id: alert.id,
              message: `${alert.severity.toUpperCase()}: ${alert.message}`,
              type: alert.type,
              priority: alert.severity,
              timestamp: new Date(alert.timestamp),
              read: false,
              location: alert.location_name,
              affected_count: alert.affected_count
            }));
            
            setNotifications(formattedNotifications);
            
            // Show critical alerts as toasts
            const criticalAlerts = formattedNotifications.filter(n => n.priority === 'critical');
            criticalAlerts.forEach(alert => {
              toast.error(alert.message, {
                position: "top-center",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            });
          }
        }
      } catch (error) {
        console.log('Using enhanced fallback notifications');
        // Enhanced fallback notifications with realistic data
        const enhancedNotifications = [
          { 
            id: Date.now(), 
            message: "🚨 CRITICAL: Extremely high crowd density at Main Ghat - 3,200 people affected", 
            type: 'critical', 
            priority: 'critical', 
            timestamp: new Date(), 
            read: false,
            location: "Main Ghat",
            affected_count: 3200
          },
          { 
            id: Date.now() + 1, 
            message: "🚌 HIGH: Additional transport services deployed to Central Hub", 
            type: 'transport', 
            priority: 'high', 
            timestamp: new Date(), 
            read: false,
            location: "Central Transport Hub",
            affected_count: 800
          },
          { 
            id: Date.now() + 2, 
            message: "🌧️ MEDIUM: Weather conditions may affect visibility - Light rain expected", 
            type: 'weather', 
            priority: 'medium', 
            timestamp: new Date(), 
            read: false,
            location: "All Areas",
            affected_count: 8000
          },
          { 
            id: Date.now() + 3, 
            message: "✅ INFO: New accessibility features activated at Temple Complex", 
            type: 'system', 
            priority: 'low', 
            timestamp: new Date(), 
            read: false,
            location: "Mahakaleshwar Temple",
            affected_count: 500
          }
        ];
        setNotifications(enhancedNotifications);
        
        // Show critical fallback alerts
        const criticalFallback = enhancedNotifications.filter(n => n.priority === 'critical');
        criticalFallback.forEach(alert => {
          toast.error(alert.message, {
            position: "top-center",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        });
      }
    };

    // Initial fetch
    fetchAlerts();

    // Set up periodic updates every 15 seconds for real-time data
    const alertInterval = setInterval(fetchAlerts, 15000);

    return () => {
      clearInterval(alertInterval);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle current location updates
  const handleCurrentLocationSet = (location) => {
    setCurrentLocation(location);
    toast.success(`📍 Current location set: ${location.name}`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Handle location updates from map interactions
  const handleLocationUpdate = (location, type) => {
    if (type === 'start') {
      setStartLoc(location);
    } else if (type === 'end') {
      setEndLoc(location);
    }
  };

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'route':
        return (
          <RoutePlanner 
            onRouteFound={setRoute} 
            onStartChange={setStartLoc} 
            onEndChange={setEndLoc}
            currentLocation={currentLocation}
          />
        );
      case 'alerts':
        return <AlertsPanel />;
      case 'stats':
        return <StatsPanel />;
      case 'settings':
        return <SettingsPanel darkMode={darkMode} onDarkModeToggle={setDarkMode} />;
      default:
        return (
          <RoutePlanner 
            onRouteFound={setRoute} 
            onStartChange={setStartLoc} 
            onEndChange={setEndLoc}
            currentLocation={currentLocation}
          />
        );
    }
  };

  return (
    <div className="map-page-root">
      <ToastContainer 
        position="top-right" 
        autoClose={4000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme={darkMode ? "dark" : "light"}
        toastClassName="custom-toast"
      />
      
      {/* Premium Navigation Bar */}
      <motion.div 
        className="premium-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="nav-left">
          <motion.button
            className="nav-btn home-btn premium-btn"
            onClick={() => window.location.href = '/'}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={20} />
            <span className="btn-tooltip">Home</span>
          </motion.button>
          
          <div className="nav-brand">
            <div className="brand-icon">
              <Star size={24} className="rotating-star" />
            </div>
            <div className="brand-text">
              <h1>Simhastha 2028</h1>
              <span className="brand-subtitle">Smart Mobility Platform</span>
            </div>
          </div>
        </div>
        
        <div className="nav-center">
          <div className="premium-search">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search locations, routes, or landmarks..." 
                className="search-input"
              />
              <motion.button 
                className="search-voice-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </motion.button>
            </div>
            <div className="search-suggestions">
              <span className="suggestion-tag">Main Ghat</span>
              <span className="suggestion-tag">Temple Complex</span>
              <span className="suggestion-tag">Transport Hub</span>
            </div>
          </div>
        </div>
        
        <div className="nav-right">
          <div className="nav-controls">
            <motion.button
              className="nav-btn control-btn"
              onClick={() => setMapStyle(mapStyle === 'satellite' ? 'street' : 'satellite')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-tooltip={`Switch to ${mapStyle === 'satellite' ? 'Street' : 'Satellite'} View`}
            >
              <Layers size={18} />
            </motion.button>
            
            <motion.button
              className="nav-btn control-btn"
              onClick={() => setShowMiniMap(!showMiniMap)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-tooltip="Toggle Mini Map"
            >
              <Target size={18} />
            </motion.button>
            
            <motion.button
              className="nav-btn notification-btn premium-notification"
              onClick={() => setShowNotifications(!showNotifications)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-tooltip="Notifications"
            >
              <Bell size={18} />
              {notifications.filter(n => !n.read).length > 0 && (
                <motion.span 
                  className="notification-badge premium-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {notifications.filter(n => !n.read).length}
                </motion.span>
              )}
              <div className="notification-pulse" />
            </motion.button>
            
            <motion.button
              className="nav-btn theme-toggle"
              onClick={() => setDarkMode(v => !v)}
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              data-tooltip={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}
            >
              <motion.div
                animate={{ rotate: darkMode ? 0 : 180 }}
                transition={{ duration: 0.5 }}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </motion.button>
            
            <motion.button
              className="nav-btn fullscreen-btn"
              onClick={toggleFullscreen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-tooltip={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && notifications.length > 0 && (
          <motion.div 
            className="notifications-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="notifications-header">
              <Activity size={18} />
              <span>Live Updates</span>
              <motion.button
                className="close-notifications"
                onClick={() => setShowNotifications(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </div>
            <div className="notifications-list">
              {notifications.slice(0, 5).map((notification) => (
                <motion.div
                  key={notification.id}
                  className={`notification-item ${notification.type}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Map View with AI Features */}
      <MapView
        route={route}
        startLoc={startLoc}
        endLoc={endLoc}
        showAccessible={showAccessible}
        showTransport={showTransport}
        showAlerts={showAlerts}
        showVIP={showVIP}
        darkMode={darkMode}
        onLocationUpdate={handleLocationUpdate}
        onCurrentLocationSet={handleCurrentLocationSet}
      />

      {/* Overlay Controls */}
      <motion.div 
        className="overlay-controls"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="overlay-header">
          <Filter size={18} />
          <span>Map Layers</span>
        </div>
        <div className="overlay-buttons">
          {overlayButtons.map((button) => {
            const IconComponent = button.icon;
            return (
              <motion.button
                key={button.id}
                className={`overlay-btn ${button.active ? 'active' : ''}`}
                onClick={button.toggle}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{ '--accent-color': button.color }}
              >
                <IconComponent size={20} />
                <span>{button.label}</span>
                <div className="overlay-btn-indicator" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            className="modern-sidebar"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="sidebar-header">
              <div className="sidebar-tabs">
                {panels.map((panel) => {
                  const IconComponent = panel.icon;
                  return (
                    <motion.button
                      key={panel.id}
                      className={`sidebar-tab ${activePanel === panel.id ? 'active' : ''}`}
                      onClick={() => setActivePanel(panel.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent size={18} />
                      <span>{panel.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            <div className="sidebar-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderActivePanel()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle */}
      <motion.button
        className="sidebar-toggle"
        onClick={() => setShowSidebar(v => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: showSidebar ? 180 : 0 }}
      >
        {showSidebar ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Quick Actions FAB */}
      <motion.div 
        className="quick-actions"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.button
          className="quick-action-btn primary"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Zap size={24} />
        </motion.button>
        <motion.button
          className="quick-action-btn secondary"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <MapPin size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
}

export default MapPage; 