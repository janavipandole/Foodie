// Sample unit test for app.js
// You can expand this with real functions from app.js or any files you want to test.

// Mock localStorage for testing
const CART_STORAGE_KEY = 'foodie:cart';
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

// Redefine loadCart for test (since app.js does not export)
const loadCart = () => {
  try {
    const raw = global.localStorage.getItem(CART_STORAGE_KEY) || '[]';
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (_) { return []; }
};

describe('App Module', () => {
  test('should run a sample test', () => {
    expect(2 + 2).toBe(4);
  });

  test('loadCart returns empty array if localStorage is empty', () => {
    global.localStorage.getItem.mockReturnValueOnce(null);
    expect(loadCart()).toEqual([]);
  });

  test('loadCart returns array from localStorage', () => {
    const cartData = JSON.stringify([{id: 1, name: 'Pizza', price: 100}]);
    global.localStorage.getItem.mockReturnValueOnce(cartData);
    expect(loadCart()).toEqual([{id: 1, name: 'Pizza', price: 100}]);
  });

  test('loadCart returns [] if localStorage data is invalid', () => {
    global.localStorage.getItem.mockReturnValueOnce('invalid json');
    expect(loadCart()).toEqual([]);
  });
});
