/**
 * Foodie IndexedDB Persistent Storage Module
 * Features: Asynchronous Object Stores for Orders and Cart with safeLocalStorage fallback.
 */

class FoodieIDB {
  constructor() {
    this.dbName = 'FoodieDB';
    this.dbVersion = 1;
    this.db = null;
    this.isSupported = 'indexedDB' in window;
    this.initPromise = this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('IndexedDB not supported in browser, using fallback storage.');
      return false;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'name' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(true);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open failed:', event.target.error);
        resolve(false);
      };
    });
  }

  async saveOrder(order) {
    await this.initPromise;
    if (!this.db) return this.saveOrderFallback(order);

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');
      const req = store.put(order);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        this.saveOrderFallback(order);
        resolve(false);
      };
    });
  }

  async getOrders() {
    await this.initPromise;
    if (!this.db) return this.getOrdersFallback();

    return new Promise((resolve) => {
      const tx = this.db.transaction('orders', 'readonly');
      const store = tx.objectStore('orders');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(this.getOrdersFallback());
    });
  }

  async syncCart(cartItems) {
    await this.initPromise;
    if (!this.db) return;

    const tx = this.db.transaction('cart', 'readwrite');
    const store = tx.objectStore('cart');
    store.clear();
    cartItems.forEach(item => store.put(item));
  }

  // Fallback Handlers
  saveOrderFallback(order) {
    const orders = JSON.parse(localStorage.getItem('foodie:orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('foodie:orders', JSON.stringify(orders));
  }

  getOrdersFallback() {
    return JSON.parse(localStorage.getItem('foodie:orders') || '[]');
  }
}

// Instantiate global IDB instance
window.foodieIDB = new FoodieIDB();
