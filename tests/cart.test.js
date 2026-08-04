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
