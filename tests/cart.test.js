/**
 * Unit Tests for Cart Math & Calculation Utilities
 */

describe('Cart Calculations Module', () => {
  const calculateCartTotal = (items, taxRate = 0.05, deliveryFee = 30.00) => {
    const subtotal = items.reduce((acc, item) => {
      const price = parseFloat(String(item.price).replace(/[₹$]/g, ''));
      return acc + (price * item.quantity);
    }, 0);

    const tax = Math.round((subtotal * taxRate + Number.EPSILON) * 100) / 100;
    const grandTotal = Math.round((subtotal + tax + deliveryFee + Number.EPSILON) * 100) / 100;

    return {
      subtotal: Math.round((subtotal + Number.EPSILON) * 100) / 100,
      tax,
      deliveryFee,
      grandTotal
    };
  };

  test('calculates correct subtotal, GST, and grand total', () => {
    const cart = [
      { name: 'Pizza', price: '₹299.00', quantity: 2 },
      { name: 'Burger', price: '₹149.00', quantity: 1 }
    ];

    const result = calculateCartTotal(cart);
    expect(result.subtotal).toBe(747.00); // 299*2 + 149 = 747
    expect(result.tax).toBe(37.35);       // 747 * 0.05 = 37.35
    expect(result.deliveryFee).toBe(30.00);
    expect(result.grandTotal).toBe(814.35); // 747 + 37.35 + 30
  });

  test('returns 0 subtotal for empty cart', () => {
    const result = calculateCartTotal([]);
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.grandTotal).toBe(30.00); // Delivery fee baseline
  });

  test('handles floating point precision safely', () => {
    const cart = [
      { name: 'Item A', price: '₹19.99', quantity: 3 }
    ];

    const result = calculateCartTotal(cart);
    expect(result.subtotal).toBe(59.97);
    expect(Number.isInteger(result.grandTotal * 100)).toBe(true);
// Mock localStorage for testing
const CART_STORAGE_KEY = 'foodie:cart';
const FAVORITES_STORAGE_KEY = 'foodie:favorites';

global.localStorage = {
  storage: {},
  getItem(key) {
    return this.storage[key] || null;
  },
  setItem(key, value) {
    this.storage[key] = String(value);
  },
  clear() {
    this.storage = {};
  }
};

// Cart utility functions to test
const addToCart = (cart, item) => {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return [...cart];
};

const calculateTotal = (cart) => {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};

const loadFavorites = () => {
  const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

describe('Cart Management & Recipe Bookmarking Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('adds new items to the cart and updates quantities correctly', () => {
    let cart = [];
    const item1 = { id: 1, name: 'Margherita Pizza', price: 250 };
    
    cart = addToCart(cart, item1);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);

    // Add same item again to test quantity increment
    cart = addToCart(cart, item1);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);

    // Verify localStorage synchronization
    const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    expect(storedCart[0].quantity).toBe(2);
  });

  test('calculates total cart price correctly', () => {
    const cart = [
      { id: 1, name: 'Burger', price: 150, quantity: 2 },
      { id: 2, name: 'Fries', price: 90, quantity: 1 }
    ];

    const total = calculateTotal(cart);
    expect(total).toBe(390); // (150 * 2) + (90 * 1)
  });

  test('persists favorited recipes correctly to localStorage', () => {
    const favorites = ['Recipe ID: 101', 'Recipe ID: 202'];
    
    saveFavorites(favorites);
    
    const loadedFavorites = loadFavorites();
    expect(loadedFavorites).toEqual(favorites);
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY))).toEqual(favorites);
  });
});
