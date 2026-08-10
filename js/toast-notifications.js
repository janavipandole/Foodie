/**
 * Animated Toast Notification System with Browser Web Notifications API Integration
 */

class FoodieToastNotificationSystem {
  constructor() {
    this.container = null;
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    if (!document.getElementById('foodie-toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'foodie-toast-container';
      this.container.className = 'foodie-toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('foodie-toast-container');
    }

    this.requestWebNotificationPermission();
  }

  requestWebNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `foodie-toast foodie-toast-${type}`;
    
    const iconMap = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info'
    };

    toast.innerHTML = `
      <i class="fa-solid ${iconMap[type] || 'fa-circle-info'}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    // Trigger Browser Web Notification if permitted
    this.sendBrowserNotification('Foodie Update', message);
  }

  dismiss(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }

  sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '../imgs/favicon.webp'
        });
      } catch (e) {}
    }
  }
}

window.foodieToast = new FoodieToastNotificationSystem();
window.showToast = (msg, type) => window.foodieToast.show(msg, type);
