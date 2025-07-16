import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Map, 
  Users, 
  Volume2, 
  VolumeX,
  Smartphone,
  Monitor,
  Palette,
  Globe,
  Save,
  RotateCcw,
  Download,
  Upload
} from "lucide-react";

const SettingsPanel = ({ darkMode, onDarkModeToggle }) => {
  const [settings, setSettings] = useState({
    notifications: {
      alerts: true,
      routes: true,
      crowd: false,
      system: true
    },
    display: {
      theme: darkMode ? 'dark' : 'light',
      mapStyle: 'satellite',
      showLabels: true,
      showGrid: false,
      animations: true
    },
    privacy: {
      location: true,
      analytics: false,
      sharing: false
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      soundAlerts: true,
      vibration: true
    },
    performance: {
      autoRefresh: true,
      refreshRate: 5,
      dataCompression: true,
      offlineMode: false
    }
  });

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const resetSettings = () => {
    setSettings({
      notifications: {
        alerts: true,
        routes: true,
        crowd: false,
        system: true
      },
      display: {
        theme: 'dark',
        mapStyle: 'satellite',
        showLabels: true,
        showGrid: false,
        animations: true
      },
      privacy: {
        location: true,
        analytics: false,
        sharing: false
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        soundAlerts: true,
        vibration: true
      },
      performance: {
        autoRefresh: true,
        refreshRate: 5,
        dataCompression: true,
        offlineMode: false
      }
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'simhastha-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="toggle-item">
      <div className="toggle-info">
        <div className="toggle-label">{label}</div>
        {description && <div className="toggle-description">{description}</div>}
      </div>
      <motion.div 
        className={`toggle-switch ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div 
          className="toggle-handle"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </div>
  );

  const SelectInput = ({ value, onChange, options, label }) => (
    <div className="select-item">
      <label className="select-label">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="select-input"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const SliderInput = ({ value, onChange, min, max, step, label, unit }) => (
    <div className="slider-item">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <span className="slider-value">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
      />
    </div>
  );

  return (
    <div className="settings-panel">
      <motion.div 
        className="settings-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="settings-title">
          <Settings size={24} />
          <h2>Settings & Preferences</h2>
        </div>
        <div className="settings-actions">
          <motion.button
            className="settings-btn secondary"
            onClick={resetSettings}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw size={16} />
            Reset
          </motion.button>
          <motion.button
            className="settings-btn primary"
            onClick={exportSettings}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} />
            Export
          </motion.button>
        </div>
      </motion.div>

      <div className="settings-content">
        {/* Display Settings */}
        <motion.div 
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="section-header">
            <Palette size={20} />
            <h3>Display & Appearance</h3>
          </div>
          <div className="section-content">
            <ToggleSwitch
              checked={darkMode}
              onChange={onDarkModeToggle}
              label="Dark Mode"
              description="Use dark theme for better night viewing"
            />
            
            <SelectInput
              value={settings.display.mapStyle}
              onChange={(value) => updateSetting('display', 'mapStyle', value)}
              label="Map Style"
              options={[
                { value: 'satellite', label: 'Satellite View' },
                { value: 'street', label: 'Street Map' },
                { value: 'terrain', label: 'Terrain' },
                { value: 'hybrid', label: 'Hybrid' }
              ]}
            />
            
            <ToggleSwitch
              checked={settings.display.showLabels}
              onChange={(value) => updateSetting('display', 'showLabels', value)}
              label="Show Labels"
              description="Display location names and markers"
            />
            
            <ToggleSwitch
              checked={settings.display.animations}
              onChange={(value) => updateSetting('display', 'animations', value)}
              label="Smooth Animations"
              description="Enable transitions and motion effects"
            />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div 
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-header">
            <Bell size={20} />
            <h3>Notifications</h3>
          </div>
          <div className="section-content">
            <ToggleSwitch
              checked={settings.notifications.alerts}
              onChange={(value) => updateSetting('notifications', 'alerts', value)}
              label="Safety Alerts"
              description="Get notified about safety incidents"
            />
            
            <ToggleSwitch
              checked={settings.notifications.routes}
              onChange={(value) => updateSetting('notifications', 'routes', value)}
              label="Route Updates"
              description="Notifications for route changes"
            />
            
            <ToggleSwitch
              checked={settings.notifications.crowd}
              onChange={(value) => updateSetting('notifications', 'crowd', value)}
              label="Crowd Density"
              description="Alerts for high crowd areas"
            />
            
            <ToggleSwitch
              checked={settings.notifications.system}
              onChange={(value) => updateSetting('notifications', 'system', value)}
              label="System Updates"
              description="Platform maintenance and updates"
            />
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div 
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <Shield size={20} />
            <h3>Privacy & Security</h3>
          </div>
          <div className="section-content">
            <ToggleSwitch
              checked={settings.privacy.location}
              onChange={(value) => updateSetting('privacy', 'location', value)}
              label="Location Services"
              description="Allow location access for better routing"
            />
            
            <ToggleSwitch
              checked={settings.privacy.analytics}
              onChange={(value) => updateSetting('privacy', 'analytics', value)}
              label="Usage Analytics"
              description="Help improve the platform with usage data"
            />
            
            <ToggleSwitch
              checked={settings.privacy.sharing}
              onChange={(value) => updateSetting('privacy', 'sharing', value)}
              label="Data Sharing"
              description="Share anonymized data with partners"
            />
          </div>
        </motion.div>

        {/* Accessibility */}
        <motion.div 
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-header">
            <Users size={20} />
            <h3>Accessibility</h3>
          </div>
          <div className="section-content">
            <ToggleSwitch
              checked={settings.accessibility.highContrast}
              onChange={(value) => updateSetting('accessibility', 'highContrast', value)}
              label="High Contrast"
              description="Increase contrast for better visibility"
            />
            
            <ToggleSwitch
              checked={settings.accessibility.largeText}
              onChange={(value) => updateSetting('accessibility', 'largeText', value)}
              label="Large Text"
              description="Increase text size throughout the app"
            />
            
            <ToggleSwitch
              checked={settings.accessibility.soundAlerts}
              onChange={(value) => updateSetting('accessibility', 'soundAlerts', value)}
              label="Sound Alerts"
              description="Audio notifications for important alerts"
            />
            
            <ToggleSwitch
              checked={settings.accessibility.vibration}
              onChange={(value) => updateSetting('accessibility', 'vibration', value)}
              label="Vibration"
              description="Haptic feedback on mobile devices"
            />
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div 
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header">
            <Monitor size={20} />
            <h3>Performance</h3>
          </div>
          <div className="section-content">
            <ToggleSwitch
              checked={settings.performance.autoRefresh}
              onChange={(value) => updateSetting('performance', 'autoRefresh', value)}
              label="Auto Refresh"
              description="Automatically update data in real-time"
            />
            
            <SliderInput
              value={settings.performance.refreshRate}
              onChange={(value) => updateSetting('performance', 'refreshRate', value)}
              min={1}
              max={30}
              step={1}
              label="Refresh Rate"
              unit="s"
            />
            
            <ToggleSwitch
              checked={settings.performance.dataCompression}
              onChange={(value) => updateSetting('performance', 'dataCompression', value)}
              label="Data Compression"
              description="Reduce bandwidth usage"
            />
            
            <ToggleSwitch
              checked={settings.performance.offlineMode}
              onChange={(value) => updateSetting('performance', 'offlineMode', value)}
              label="Offline Mode"
              description="Cache data for offline access"
            />
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div 
          className="settings-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            className="settings-btn primary large"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={20} />
            Save All Settings
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPanel;