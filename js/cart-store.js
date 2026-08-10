/**
 * Reactive Cart State Management Store with Cross-Tab Synchronization
 * Pattern: Observer / Pub-Sub Pattern with safeLocalStorage Persistence
 */

class CartStore {
  constructor() {
    this.storageKey = 'foodie:cart';
    this.listeners = new Set();
    this.items = this.loadCart();

    this.initCrossTabSync();
  }

  // Safe localStorage loader
  loadCart() {
    try {
      if (window.safeLocalStorage) {
        return window.safeLocalStorage.getItem(this.storageKey) || [];
      }
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('CartStore load error:', e);
      return [];
    }
  }

  saveCart() {
    try {
      if (window.safeLocalStorage) {
        window.safeLocalStorage.setItem(this.storageKey, this.items);
      } else {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      }
    } catch (e) {
      console.error('CartStore save error:', e);
    }
    this.notify();
  }

  // Subscribe UI listeners
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
      // Immediately call with current state
      callback(this.getState());
    }
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(cb => {
      try { cb(state); } catch (e) { console.error('Cart listener error:', e); }
    });
  }

  // Cross-Tab Synchronization
  initCrossTabSync() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        this.items = this.loadCart();
        this.notify();
      }
    });
  }

  getItems() {
    return [...this.items];
  }

  getCartCount() {
    return this.items.reduce((acc, item) => acc + (parseInt(item.quantity) || 1), 0);
  }

  getCartTotal() {
    const total = this.items.reduce((acc, item) => {
      const price = parseFloat(String(item.price || 0).replace(/[₹$]/g, ''));
      return acc + (price * (parseInt(item.quantity) || 1));
    }, 0);
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }

  getState() {
    return {
      items: this.getItems(),
      count: this.getCartCount(),
      total: this.getCartTotal()
    };
  }

  addItem(product) {
    if (!product || !product.name) return;
    const existingIndex = this.items.findIndex(item => item.name === product.name);
    
    if (existingIndex > -1) {
      this.items[existingIndex].quantity = (this.items[existingIndex].quantity || 1) + (product.quantity || 1);
    } else {
      this.items.push({
        id: product.id || Date.now(),
        name: product.name,
        price: product.price,
        image: product.image || '../imgs/pizza.webp',
        quantity: product.quantity || 1
      });
    }
    this.saveCart();
  }

  removeItem(productName) {
    this.items = this.items.filter(item => item.name !== productName);
    this.saveCart();
  }

  updateQuantity(productName, newQuantity) {
    const qty = parseInt(newQuantity);
    if (isNaN(qty) || qty <= 0) {
      this.removeItem(productName);
      return;
    }
    const item = this.items.find(i => i.name === productName);
    if (item) {
      item.quantity = qty;
      this.saveCart();
    }
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }
}

// Global Cart Store Instance
window.cartStore = new CartStore();

// Auto-bind UI badges on load
document.addEventListener('DOMContentLoaded', () => {
  window.cartStore.subscribe(({ count }) => {
    document.querySelectorAll('.cart-value, .cart-count-badge').forEach(badge => {
      badge.textContent = count;
    });
  });
});
