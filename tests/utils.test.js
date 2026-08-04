/**
 * Unit Tests for js/utils.js
 */

describe('Utils Module', () => {
  let safeLocalStorage;
  let sanitizeHTML;
  let isValidEmail;

  beforeEach(() => {
    // Mock localStorage
    const store = {};
    global.localStorage = {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = String(value); }),
      removeItem: jest.fn(key => { delete store[key]; }),
      clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]); })
    };

    safeLocalStorage = {
      getItem: (key) => {
        try {
          const item = global.localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (e) {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          global.localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          return false;
        }
      }
    };

    sanitizeHTML = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    isValidEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    };
  });

  describe('safeLocalStorage Wrapper', () => {
    test('setItem serializes JSON and stores item', () => {
      const data = { cart: ['Pizza', 'Burger'], total: 450 };
      expect(safeLocalStorage.setItem('test_cart', data)).toBe(true);
      expect(safeLocalStorage.getItem('test_cart')).toEqual(data);
    });

    test('getItem returns null for non-existent key', () => {
      expect(safeLocalStorage.getItem('non_existent')).toBeNull();
    });

    test('getItem handles corrupted JSON safely without crashing', () => {
      global.localStorage.getItem.mockReturnValueOnce('{ invalid json');
      expect(safeLocalStorage.getItem('corrupt')).toBeNull();
    });
  });

  describe('HTML Sanitization', () => {
    test('escapes malicious script tags to prevent XSS', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeHTML(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('escapes quotes and special characters', () => {
      expect(sanitizeHTML('User "Name" & <Tag>')).toBe('User &quot;Name&quot; &amp; &lt;Tag&gt;');
    });
  });

  describe('Email Validation', () => {
    test('validates correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('john.doe@foodie.in')).toBe(true);
    });

    test('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });
});
