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
  Compass,
  Wifi,
  Battery,
  Signal,
  Star,
  TrendingUp,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Palette
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
    // Enhanced notifications with smart categorization
    const notificationInterval = setInterval(() => {
      const smartNotifications = [
        { message: "🚨 High crowd density at Main Ghat - Alternative routes suggested", type: 'critical', priority: 'high' },
        { message: "🚌 Express shuttle service now available from Transport Hub A", type: 'transport', priority: 'medium' },
        { message: "🌧️ Weather update: Light rain expected in 30 minutes", type: 'weather', priority: 'medium' },
        { message: "👑 VIP convoy movement - Route diversions active", type: 'vip', priority: 'high' },
        { message: "✅ New accessibility ramp installed at Ghat 2", type: 'accessibility', priority: 'low' },
        { message: "📊 Peak hours detected - Smart routing activated", type: 'system', priority: 'medium' },
        { message: "🏥 Medical team deployed to Zone 3", type: 'emergency', priority: 'critical' },
        { message: "🎯 Your destination has optimal crowd levels", type: 'route', priority: 'low' }
      ];
      
      const notification = smartNotifications[Math.floor(Math.random() * smartNotifications.length)];
      const newNotification = {
        id: Date.now(),
        ...notification,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 6)]);
      
      // Smart toast notifications for critical alerts
      if (notification.priority === 'critical') {
        toast.error(notification.message, {
          position: "top-center",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }, 12000);

    return () => {
      clearInterval(notificationInterval);
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

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'route':
        return <RoutePlanner onRouteFound={setRoute} onStartChange={setStartLoc} onEndChange={setEndLoc} />;
      case 'alerts':
        return <AlertsPanel />;
      case 'stats':
        return <StatsPanel />;
      case 'settings':
        return <SettingsPanel darkMode={darkMode} onDarkModeToggle={setDarkMode} />;
      default:
        return <RoutePlanner onRouteFound={setRoute} onStartChange={setStartLoc} onEndChange={setEndLoc} />;
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

      {/* Map View */}
      <MapView
        route={route}
        startLoc={startLoc}
        endLoc={endLoc}
        showAccessible={showAccessible}
        showTransport={showTransport}
        showAlerts={showAlerts}
        showVIP={showVIP}
        darkMode={darkMode}
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