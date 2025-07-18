/**
 * Ultra-Strict Notification Manager
 * Completely prevents notification spam with multiple layers of protection
 */

import { toast } from 'react-toastify';

class NotificationManager {
  constructor() {
    this.notificationHistory = {};
    this.minimumInterval = 5000; // 5 seconds between similar notifications
    this.globalCooldown = 2000; // 2 second global cooldown between any notifications
    this.lastNotificationTime = 0;
    this.pendingNotifications = {};
    this.permanentlyBlocked = new Set(); // Permanently block certain IDs
    this.sessionShown = new Set(); // Track what's been shown this session
  }

  /**
   * Show a notification with ultra-strict spam protection
   * @param {string} id - Unique identifier for this notification type
   * @param {string} message - Notification message
   * @param {object} options - Toast options
   * @returns {boolean} - Whether notification was shown
   */
  show(id, message, options = {}) {
    // Location notifications get special treatment - only once per session
    if (id.includes('location-') || id.includes('ujjain-') || id.includes('mp-')) {
      if (this.sessionShown.has(id)) {
        console.log(`Blocked duplicate location notification: ${id}`);
        return false;
      }
      this.sessionShown.add(id);
    }

    // Check if permanently blocked
    if (this.permanentlyBlocked.has(id)) {
      return false;
    }

    const now = Date.now();
    const lastShown = this.notificationHistory[id] || 0;
    const timeSinceLastSimilar = now - lastShown;
    const timeSinceLastAny = now - this.lastNotificationTime;
    
    // Clear any pending notification with this ID
    if (this.pendingNotifications[id]) {
      clearTimeout(this.pendingNotifications[id]);
      delete this.pendingNotifications[id];
    }
    
    // Ultra-strict cooldown for similar notifications
    if (timeSinceLastSimilar < this.minimumInterval) {
      console.log(`Blocked similar notification (${timeSinceLastSimilar}ms < ${this.minimumInterval}ms): ${id}`);
      return false;
    }
    
    // Global cooldown check
    if (timeSinceLastAny < this.globalCooldown) {
      console.log(`Global cooldown active (${timeSinceLastAny}ms < ${this.globalCooldown}ms): ${id}`);
      return false;
    }
    
    // Show immediately
    return this._showToast(id, message, options);
  }
  
  /**
   * Internal method to actually show the toast
   */
  _showToast(id, message, options) {
    const now = Date.now();
    this.notificationHistory[id] = now;
    this.lastNotificationTime = now;
    
    const defaultOptions = {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    };
    
    console.log(`Showing notification: ${id} - ${message}`);
    
    toast[options.type || 'info'](message, {
      ...defaultOptions,
      ...options
    });
    
    return true;
  }
  
  /**
   * Permanently block a notification ID
   */
  blockPermanently(id) {
    this.permanentlyBlocked.add(id);
  }
  
  /**
   * Clear notification history for testing
   */
  reset() {
    this.notificationHistory = {};
    this.lastNotificationTime = 0;
    this.sessionShown.clear();
    Object.keys(this.pendingNotifications).forEach(id => {
      clearTimeout(this.pendingNotifications[id]);
    });
    this.pendingNotifications = {};
  }
  
  /**
   * Get debug info
   */
  getDebugInfo() {
    return {
      history: this.notificationHistory,
      sessionShown: Array.from(this.sessionShown),
      blocked: Array.from(this.permanentlyBlocked),
      pending: Object.keys(this.pendingNotifications)
    };
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;