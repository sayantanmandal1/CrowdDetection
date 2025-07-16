import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Users, 
  Shield, 
  Zap, 
  Navigation, 
  Activity,
  Globe,
  Smartphone,
  Brain,
  Award,
  ChevronRight,
  Play,
  Star,
  TrendingUp
} from "lucide-react";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [stats, setStats] = useState({ users: 0, routes: 0, alerts: 0 });

  const features = [
    {
      icon: <Brain className="feature-icon" />,
      title: "AI-Powered Routing",
      description: "Advanced machine learning algorithms optimize routes in real-time"
    },
    {
      icon: <Shield className="feature-icon" />,
      title: "Safety First",
      description: "Comprehensive safety monitoring with instant emergency alerts"
    },
    {
      icon: <Users className="feature-icon" />,
      title: "Crowd Intelligence",
      description: "Dynamic crowd density analysis prevents overcrowding"
    },
    {
      icon: <Zap className="feature-icon" />,
      title: "Real-time Updates",
      description: "Live data processing for instant route adjustments"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      const targets = { users: 50000, routes: 1200, alerts: 340 };
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setStats({
          users: Math.floor(targets.users * progress),
          routes: Math.floor(targets.routes * progress),
          alerts: Math.floor(targets.alerts * progress)
        });
        
        if (step >= steps) clearInterval(timer);
      }, stepTime);
    };
    
    setTimeout(animateStats, 1000);
  }, []);

  return (
    <div className="landing-root">
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <motion.div 
          className="hero-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="hero-badge">
            <Award className="badge-icon" />
            <span>Hackathon Winner 2024</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-gradient">Simhastha 2028</span>
            <br />Smart Mobility Platform
          </h1>
          
          <p className="hero-description">
            Revolutionary AI-powered crowd management and intelligent routing system 
            designed for the world's largest religious gathering. Experience the future 
            of smart city infrastructure.
          </p>
          
          <div className="hero-actions">
            <motion.button
              className="cta-primary"
              onClick={() => navigate("/map")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="cta-icon" />
              Launch Platform
              <ChevronRight className="cta-arrow" />
            </motion.button>
            
            <motion.button
              className="cta-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Activity className="cta-icon" />
              View Demo
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="stats-section"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.users.toLocaleString()}+</div>
            <div className="stat-label">Active Users</div>
            <TrendingUp className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.routes.toLocaleString()}+</div>
            <div className="stat-label">Smart Routes</div>
            <Navigation className="stat-icon" />
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.alerts}</div>
            <div className="stat-label">Safety Alerts</div>
            <Shield className="stat-icon" />
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="features-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <div className="features-header">
          <h2 className="section-title">Cutting-Edge Features</h2>
          <p className="section-subtitle">
            Powered by advanced AI and real-time data processing
          </p>
        </div>
        
        <div className="features-showcase">
          <div className="features-list">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`feature-item ${index === currentFeature ? 'active' : ''}`}
                onClick={() => setCurrentFeature(index)}
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
                <ChevronRight className="feature-arrow" />
              </motion.div>
            ))}
          </div>
          
          <div className="feature-visual">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                className="feature-display"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <div className="feature-display-icon">
                  {features[currentFeature].icon}
                </div>
                <div className="feature-display-content">
                  <h3>{features[currentFeature].title}</h3>
                  <p>{features[currentFeature].description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div 
        className="tech-section"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <h3 className="tech-title">Built with Modern Technology</h3>
        <div className="tech-stack">
          <div className="tech-item">
            <Globe className="tech-icon" />
            <span>React 19</span>
          </div>
          <div className="tech-item">
            <MapPin className="tech-icon" />
            <span>Leaflet Maps</span>
          </div>
          <div className="tech-item">
            <Brain className="tech-icon" />
            <span>AI/ML</span>
          </div>
          <div className="tech-item">
            <Smartphone className="tech-icon" />
            <span>PWA Ready</span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        className="landing-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <Star className="logo-icon" />
              <span>Simhastha 2028</span>
            </div>
            <p>Revolutionizing crowd management through intelligent technology</p>
          </div>
          <div className="footer-right">
            <div className="footer-badge">
              Made with ❤️ for Innovation
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default LandingPage; 