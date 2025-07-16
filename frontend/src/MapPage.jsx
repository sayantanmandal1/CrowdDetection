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
  Activity
} from "lucide-react";
import MapView from "./components/MapView";
import RoutePlanner from "./components/RoutePlanner";
import AlertsPanel from "./components/AlertsPanel";
import StatsPanel from "./components/StatsPanel";
import SettingsPanel from "./components/SettingsPanel";
import { ToastContainer } from "react-toastify";
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
  const [darkMode, setDarkMode] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activePanel, setActivePanel] = useState('route');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState([]);

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
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const messages = [
        "High crowd density detected at Ghat 3",
        "New safe route available via Transport Hub A",
        "Weather alert: Light rain expected",
        "VIP movement scheduled in 15 minutes"
      ];
      
      const newNotification = {
        id: Date.now(),
        message: messages[Math.floor(Math.random() * messages.length)],
        type: Math.random() > 0.5 ? 'info' : 'warning',
        timestamp: new Date()
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
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
      
      {/* Top Navigation Bar */}
      <motion.div 
        className="top-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="nav-left">
          <motion.button
            className="nav-btn home-btn"
            onClick={() => window.location.href = '/'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={20} />
          </motion.button>
          
          <div className="nav-title">
            <h1>Smart Mobility Platform</h1>
            <span className="nav-subtitle">Real-time Crowd Management</span>
          </div>
        </div>
        
        <div className="nav-center">
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search locations, routes..." />
          </div>
        </div>
        
        <div className="nav-right">
          <motion.button
            className="nav-btn notification-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </motion.button>
          
          <motion.button
            className="nav-btn"
            onClick={() => setDarkMode(v => !v)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          
          <motion.button
            className="nav-btn"
            onClick={toggleFullscreen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {notifications.length > 0 && (
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
            </div>
            <div className="notifications-list">
              {notifications.slice(0, 3).map((notification) => (
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