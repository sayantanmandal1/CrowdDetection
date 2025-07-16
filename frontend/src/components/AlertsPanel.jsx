import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Search,
  Volume2,
  VolumeX,
  RefreshCw,
  Activity,
  Wifi,
  WifiOff
} from "lucide-react";
import { toast } from "react-toastify";

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [alertStats, setAlertStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0
  });

  const alertTypes = [
    { id: 'all', label: 'All Alerts', icon: Shield, color: '#667eea' },
    { id: 'critical', label: 'Critical', icon: AlertTriangle, color: '#f5576c' },
    { id: 'warning', label: 'Warning', icon: AlertCircle, color: '#ffd700' },
    { id: 'info', label: 'Info', icon: CheckCircle, color: '#4facfe' },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle, color: '#43e97b' }
  ];

  const mockAlerts = [
    {
      id: 1,
      type: 'critical',
      title: 'High Crowd Density Alert',
      message: 'Extremely high crowd density detected at Main Ghat. Immediate action required.',
      location: 'Main Ghat - Sector A',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'active',
      priority: 'high',
      affectedUsers: 2500,
      estimatedDuration: '30-45 minutes',
      actions: ['Redirect traffic', 'Deploy additional security', 'Activate emergency protocols']
    },
    {
      id: 2,
      type: 'warning',
      title: 'Weather Advisory',
      message: 'Light rain expected in the next 30 minutes. Prepare for slippery conditions.',
      location: 'All Areas',
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'active',
      priority: 'medium',
      affectedUsers: 8000,
      estimatedDuration: '2-3 hours',
      actions: ['Issue weather warnings', 'Prepare shelters', 'Monitor conditions']
    },
    {
      id: 3,
      type: 'info',
      title: 'Transport Update',
      message: 'Additional shuttle services deployed to Transport Hub B.',
      location: 'Transport Hub B',
      timestamp: new Date(Date.now() - 25 * 60000),
      status: 'active',
      priority: 'low',
      affectedUsers: 500,
      estimatedDuration: 'Ongoing',
      actions: ['Update signage', 'Inform passengers', 'Monitor capacity']
    },
    {
      id: 4,
      type: 'critical',
      title: 'Medical Emergency',
      message: 'Medical emergency reported at Temple Complex. Emergency services dispatched.',
      location: 'Temple Complex - East Wing',
      timestamp: new Date(Date.now() - 35 * 60000),
      status: 'resolving',
      priority: 'high',
      affectedUsers: 100,
      estimatedDuration: '15-20 minutes',
      actions: ['Medical team deployed', 'Clear access routes', 'Crowd control']
    },
    {
      id: 5,
      type: 'resolved',
      title: 'Route Blockage Cleared',
      message: 'Temporary blockage on Route 3 has been cleared. Normal traffic resumed.',
      location: 'Route 3 - Junction Point',
      timestamp: new Date(Date.now() - 45 * 60000),
      status: 'resolved',
      priority: 'medium',
      affectedUsers: 1200,
      estimatedDuration: 'Resolved',
      actions: ['Route reopened', 'Traffic normalized', 'Monitoring continues']
    }
  ];

  useEffect(() => {
    // Fetch real-time alerts from sophisticated backend
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:8000/alerts/current');
        if (response.ok) {
          const data = await response.json();
          if (data.alerts && data.alerts.length > 0) {
            const formattedAlerts = data.alerts.map(alert => ({
              id: alert.id,
              type: alert.severity,
              title: alert.message.split(':')[1] || alert.message,
              message: alert.message,
              location: alert.location_name,
              timestamp: new Date(alert.timestamp),
              status: alert.status,
              priority: alert.severity,
              affectedUsers: alert.affected_count,
              estimatedDuration: alert.estimated_response_time,
              actions: alert.actions_taken || ['Monitoring situation', 'Response team notified']
            }));
            
            setAlerts(formattedAlerts);
            updateAlertStats(formattedAlerts);
          } else {
            // Use enhanced mock data if no alerts from backend
            setAlerts(mockAlerts);
            updateAlertStats(mockAlerts);
          }
        } else {
          setAlerts(mockAlerts);
          updateAlertStats(mockAlerts);
        }
      } catch (error) {
        console.log('Using enhanced mock alerts data');
        setAlerts(mockAlerts);
        updateAlertStats(mockAlerts);
      }
    };

    fetchAlerts();
  }, [mockAlerts]);

  useEffect(() => {
    filterAlerts();
  }, [alerts, activeFilter, searchTerm]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        setLastUpdate(new Date());
        
        if (soundEnabled && newAlert.type === 'critical') {
          // Play alert sound (would be actual audio in production)
          toast.error(`🚨 ${newAlert.title}`, {
            position: "top-center",
            autoClose: 8000,
          });
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, soundEnabled]);

  const generateRandomAlert = () => {
    const types = ['critical', 'warning', 'info'];
    const locations = ['Main Ghat', 'Temple Complex', 'Transport Hub A', 'Parking Zone 1'];
    const titles = [
      'Crowd Density Alert',
      'Security Checkpoint Update',
      'Weather Advisory',
      'Transport Service Update',
      'Emergency Response'
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];

    return {
      id: Date.now(),
      type,
      title,
      message: `Alert generated for ${location}. Monitoring situation closely.`,
      location,
      timestamp: new Date(),
      status: 'active',
      priority: type === 'critical' ? 'high' : type === 'warning' ? 'medium' : 'low',
      affectedUsers: Math.floor(Math.random() * 3000) + 100,
      estimatedDuration: '15-30 minutes',
      actions: ['Monitor situation', 'Take appropriate action', 'Update status']
    };
  };

  const updateAlertStats = (alertList) => {
    const stats = alertList.reduce((acc, alert) => {
      acc.total++;
      acc[alert.type]++;
      return acc;
    }, { total: 0, critical: 0, warning: 0, info: 0, resolved: 0 });
    
    setAlertStats(stats);
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === activeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const getAlertIcon = (type, status) => {
    if (status === 'resolved') return CheckCircle;
    
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertCircle;
      case 'info': return CheckCircle;
      default: return Shield;
    }
  };

  const getAlertColor = (type, status) => {
    if (status === 'resolved') return '#43e97b';
    
    switch (type) {
      case 'critical': return '#f5576c';
      case 'warning': return '#ffd700';
      case 'info': return '#4facfe';
      default: return '#667eea';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f5576c';
      case 'medium': return '#ffd700';
      case 'low': return '#43e97b';
      default: return '#667eea';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#f5576c';
      case 'resolving': return '#ffd700';
      case 'resolved': return '#43e97b';
      default: return '#667eea';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleAlertAction = (alertId, action) => {
    toast.success(`Action "${action}" initiated for alert #${alertId}`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="alerts-panel-premium">
      <motion.div 
        className="alerts-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-title">
          <Shield size={24} />
          <h2>Safety Alert Center</h2>
        </div>
        <div className="header-subtitle">
          Real-time monitoring and incident management
        </div>
        <div className="header-controls">
          <motion.button
            className={`control-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {autoRefresh ? <Wifi size={16} /> : <WifiOff size={16} />}
          </motion.button>
          <motion.button
            className={`control-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Alert Statistics */}
      <motion.div 
        className="alert-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stats-grid">
          {alertTypes.map((type) => {
            const IconComponent = type.icon;
            const count = type.id === 'all' ? alertStats.total : alertStats[type.id];
            
            return (
              <motion.div
                key={type.id}
                className={`stat-card ${activeFilter === type.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(type.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{ '--accent-color': type.color }}
              >
                <div className="stat-icon">
                  <IconComponent size={20} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{count}</div>
                  <div className="stat-label">{type.label}</div>
                </div>
                <div className="stat-indicator" />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="search-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search alerts by title, location, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="last-update">
          <RefreshCw size={14} />
          <span>Updated {formatTimeAgo(lastUpdate)}</span>
        </div>
      </motion.div>

      {/* Alerts List */}
      <motion.div 
        className="alerts-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const IconComponent = getAlertIcon(alert.type, alert.status);
            
            return (
              <motion.div
                key={alert.id}
                className={`alert-card ${alert.type} ${alert.status}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                style={{ '--alert-color': getAlertColor(alert.type, alert.status) }}
              >
                <div className="alert-header">
                  <div className="alert-icon">
                    <IconComponent size={20} />
                  </div>
                  <div className="alert-meta">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-location">
                      <MapPin size={14} />
                      <span>{alert.location}</span>
                    </div>
                  </div>
                  <div className="alert-badges">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(alert.priority) }}
                    >
                      {alert.priority}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(alert.status) }}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>

                <div className="alert-message">
                  {alert.message}
                </div>

                <div className="alert-details">
                  <div className="detail-item">
                    <Users size={14} />
                    <span>{alert.affectedUsers.toLocaleString()} affected</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={14} />
                    <span>{alert.estimatedDuration}</span>
                  </div>
                  <div className="detail-item">
                    <Activity size={14} />
                    <span>{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                </div>

                <div className="alert-actions">
                  <div className="actions-label">Quick Actions:</div>
                  <div className="actions-list">
                    {alert.actions.map((action, idx) => (
                      <motion.button
                        key={idx}
                        className="action-btn"
                        onClick={() => handleAlertAction(alert.id, action)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {action}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="alert-pulse" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <motion.div 
            className="no-alerts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CheckCircle size={48} />
            <h3>No alerts found</h3>
            <p>
              {searchTerm 
                ? `No alerts match "${searchTerm}"`
                : activeFilter === 'all' 
                  ? 'All systems operating normally'
                  : `No ${activeFilter} alerts at this time`
              }
            </p>
          </motion.div>
        )}
      </motion.div>

      <style>{`
        .alerts-panel-premium {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
        }

        .alerts-header {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-title > div:first-child {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .header-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .header-controls {
          display: flex;
          gap: 0.5rem;
        }

        .control-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: var(--glass-hover);
          color: var(--text-primary);
        }

        .control-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .alert-stats {
          margin-bottom: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
        }

        .stat-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          background: var(--glass-hover);
          border-color: var(--accent-color);
        }

        .stat-card.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          box-shadow: 0 4px 16px rgba(var(--accent-color), 0.3);
        }

        .stat-icon {
          margin-bottom: 0.5rem;
          color: var(--accent-color);
        }

        .stat-card.active .stat-icon {
          color: white;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .stat-card.active .stat-number {
          color: white;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-card.active .stat-label {
          color: rgba(255, 255, 255, 0.9);
        }

        .search-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .search-container {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-secondary);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: var(--panel-bg);
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .last-update {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .alerts-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          scrollbar-width: thin;
          scrollbar-color: var(--primary) var(--glass-bg);
        }

        .alerts-list::-webkit-scrollbar {
          width: 6px;
        }

        .alerts-list::-webkit-scrollbar-track {
          background: var(--glass-bg);
          border-radius: 3px;
        }

        .alerts-list::-webkit-scrollbar-thumb {
          background: var(--gradient-primary);
          border-radius: 3px;
        }

        .alert-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-left: 4px solid var(--alert-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .alert-card:hover {
          background: var(--glass-hover);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .alert-card.critical {
          background: rgba(245, 87, 108, 0.05);
        }

        .alert-card.warning {
          background: rgba(255, 215, 0, 0.05);
        }

        .alert-card.info {
          background: rgba(79, 172, 254, 0.05);
        }

        .alert-card.resolved {
          background: rgba(67, 233, 123, 0.05);
          opacity: 0.8;
        }

        .alert-card.critical.active .alert-pulse {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid var(--alert-color);
          border-radius: var(--radius-md);
          animation: pulse-alert 2s infinite;
          pointer-events: none;
        }

        @keyframes pulse-alert {
          0% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.02);
          }
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
        }

        .alert-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .alert-icon {
          color: var(--alert-color);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .alert-meta {
          flex: 1;
        }

        .alert-title {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .alert-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .alert-badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .priority-badge,
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .alert-message {
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .alert-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .alert-actions {
          border-top: 1px solid var(--border);
          padding-top: 1rem;
        }

        .actions-label {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .actions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .action-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          color: var(--text-primary);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .no-alerts {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .no-alerts h3 {
          margin: 1rem 0 0.5rem 0;
          color: var(--text-primary);
        }

        .no-alerts p {
          margin: 0;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .search-filters {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          
          .alert-header {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .alert-badges {
            flex-direction: row;
            align-items: flex-start;
          }
          
          .alert-details {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .actions-list {
            flex-direction: column;
          }
          
          .action-btn {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .alert-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AlertsPanel;