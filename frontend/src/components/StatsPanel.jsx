import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Navigation, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatsPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 45230,
    activeRoutes: 1247,
    safetyAlerts: 23,
    avgResponseTime: 2.3
  });

  const [crowdData, setCrowdData] = useState([]);
  const [routeData, setRouteData] = useState([]);
  const [alertData, setAlertData] = useState([]);

  useEffect(() => {
    // Generate mock real-time data
    const generateCrowdData = () => {
      const data = [];
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: time.getHours() + ':00',
          crowd: Math.floor(Math.random() * 5000) + 2000,
          capacity: 8000
        });
      }
      return data;
    };

    const generateRouteData = () => {
      return [
        { name: 'Optimal', value: 65, color: '#43e97b' },
        { name: 'Alternative', value: 25, color: '#4facfe' },
        { name: 'Emergency', value: 10, color: '#f5576c' }
      ];
    };

    const generateAlertData = () => {
      const data = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          high: Math.floor(Math.random() * 10) + 5,
          medium: Math.floor(Math.random() * 20) + 10,
          low: Math.floor(Math.random() * 30) + 15
        });
      }
      return data;
    };

    setCrowdData(generateCrowdData());
    setRouteData(generateRouteData());
    setAlertData(generateAlertData());

    // Update stats periodically
    const interval = setInterval(() => {
      setStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 100) - 50,
        activeRoutes: prev.activeRoutes + Math.floor(Math.random() * 20) - 10,
        safetyAlerts: Math.max(0, prev.safetyAlerts + Math.floor(Math.random() * 6) - 3),
        avgResponseTime: Math.max(0.1, prev.avgResponseTime + (Math.random() * 0.4) - 0.2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Active Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "#4facfe"
    },
    {
      title: "Active Routes",
      value: stats.activeRoutes.toLocaleString(),
      change: "+8.2%",
      trend: "up",
      icon: Navigation,
      color: "#43e97b"
    },
    {
      title: "Safety Alerts",
      value: stats.safetyAlerts,
      change: "-15.3%",
      trend: "down",
      icon: Shield,
      color: "#f5576c"
    },
    {
      title: "Response Time",
      value: `${stats.avgResponseTime.toFixed(1)}s`,
      change: "-5.1%",
      trend: "down",
      icon: Clock,
      color: "#ffd700"
    }
  ];

  return (
    <div className="stats-panel">
      <motion.div 
        className="stats-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="stats-title">
          <Activity size={24} />
          <h2>Real-time Analytics</h2>
        </div>
        <div className="stats-subtitle">
          Live monitoring and performance metrics
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <motion.div
              key={stat.title}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="stat-card-header">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <IconComponent size={20} />
                </div>
                <div className={`stat-trend ${stat.trend}`}>
                  <TrendIcon size={16} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.title}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Crowd Density Chart */}
      <motion.div 
        className="chart-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="chart-header">
          <h3>Crowd Density (24h)</h3>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#4facfe' }}></div>
              <span>Current</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f5576c' }}></div>
              <span>Capacity</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={crowdData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Area type="monotone" dataKey="crowd" stroke="#4facfe" fill="#4facfe" fillOpacity={0.3} />
            <Line type="monotone" dataKey="capacity" stroke="#f5576c" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Route Distribution */}
      <motion.div 
        className="chart-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="chart-header">
          <h3>Route Distribution</h3>
        </div>
        <div className="pie-chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={routeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {routeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {routeData.map((item, index) => (
              <div key={index} className="pie-legend-item">
                <div className="pie-legend-color" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Alert Trends */}
      <motion.div 
        className="chart-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="chart-header">
          <h3>Alert Trends (7 days)</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={alertData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Bar dataKey="high" stackId="a" fill="#f5576c" />
            <Bar dataKey="medium" stackId="a" fill="#ffd700" />
            <Bar dataKey="low" stackId="a" fill="#43e97b" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Status */}
      <motion.div 
        className="status-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <div className="status-item success">
          <CheckCircle size={20} />
          <div>
            <div className="status-label">System Status</div>
            <div className="status-value">Operational</div>
          </div>
        </div>
        <div className="status-item warning">
          <AlertTriangle size={20} />
          <div>
            <div className="status-label">Active Incidents</div>
            <div className="status-value">3 Minor</div>
          </div>
        </div>
        <div className="status-item info">
          <MapPin size={20} />
          <div>
            <div className="status-label">Coverage</div>
            <div className="status-value">98.5%</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsPanel;