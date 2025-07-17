/**
 * Global Notification Manager
 * Prevents notification spam by enforcing strict throttling and debouncing
 */

import { toast } from 'react-toastify';

class NotificationManager {
  constructor() {
    this.notificationHistory = {};
    this.minimumInterval = 3000; // 3 seconds between similar notifications
    this.globalCooldown = 1000; // 1 second global cooldown between any notifications
    this.lastNotificationTime = 0;
    this.pendingNotifications = {};
  }

  /**
   * Show a notification with spam protection
   * @param {string} id - Unique identifier for this notification type
   * @param {string} message - Notification message
   * @param {object} options - Toast options
   * @returns {boolean} - Whether notification was shown
   */
  show(id, message, options = {}) {
    const now = Date.now();
    const lastShown = this.notificationHistory[id] || 0;
    const timeSinceLastSimilar = now - lastShown;
    const timeSinceLastAny = now - this.lastNotificationTime;
    
    // Clear any pending notification with this ID
    if (this.pendingNotifications[id]) {
      clearTimeout(this.pendingNotifications[id]);
      delete this.pendingNotifications[id];
    }
    
    // Check if we're in cooldown period
    if (timeSinceLastSimilar < this.minimumInterval) {
      return false;
    }
    
    // Global cooldown check
    if (timeSinceLastAny < this.globalCooldown) {
      // Schedule for later if in global cooldown
      this.pendingNotifications[id] = setTimeout(() => {
        this._showToast(id, message, options);
        delete this.pendingNotifications[id];
      }, this.globalCooldown - timeSinceLastAny);
      return true;
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
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    };
    
    toast[options.type || 'info'](message, {
      ...defaultOptions,
      ...options
    });
    
    return true;
  }
  
  /**
   * Clear notification history for testing
   */
  reset() {
    this.notificationHistory = {};
    this.lastNotificationTime = 0;
    Object.keys(this.pendingNotifications).forEach(id => {
      clearTimeout(this.pendingNotifications[id]);
    });
    this.pendingNotifications = {};
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;