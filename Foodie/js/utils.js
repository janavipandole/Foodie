/**
 * Performance Utilities
 * Provides debounce, throttle, and other performance optimization helpers
 */

/**
 * Debounce function - delays execution until after wait time has elapsed since last call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute on leading edge instead of trailing
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

/**
 * Throttle function - ensures function is called at most once per specified time period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function executedFunction(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Request Animation Frame throttle - optimized for visual updates
 * @param {Function} func - Function to throttle
 * @returns {Function} RAF-throttled function
 */
export const rafThrottle = (func) => {
    let rafId = null;
    return function executedFunction(...args) {
        const context = this;
        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                func.apply(context, args);
                rafId = null;
            });
        }
    };
};

/**
 * Safe localStorage wrapper with error handling
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage: ${error.message}`);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage: ${error.message}`);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage: ${error.message}`);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error(`Error clearing localStorage: ${error.message}`);
            return false;
        }
    }
};

/**
 * Safe DOM query selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null} Found element or null
 */
export const safeQuerySelector = (selector, parent = document) => {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        console.error(`Invalid selector "${selector}": ${error.message}`);
        return null;
    }
};

/**
 * Safe DOM query selector all with error handling
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {NodeList|Array} Found elements or empty array
 */
export const safeQuerySelectorAll = (selector, parent = document) => {
    try {
        return parent.querySelectorAll(selector);
    } catch (error) {
        console.error(`Invalid selector "${selector}": ${error.message}`);
        return [];
    }
};

/**
 * Event listener manager for cleanup
 */
export class EventManager {
    constructor() {
        this.listeners = [];
    }
    
    add(element, event, handler, options) {
        if (!element) return;
        element.addEventListener(event, handler, options);
        this.listeners.push({ element, event, handler, options });
    }
    
    remove(element, event, handler) {
        if (!element) return;
        element.removeEventListener(event, handler);
        this.listeners = this.listeners.filter(
            listener => !(listener.element === element && 
                         listener.event === event && 
                         listener.handler === handler)
        );
    }
    
    removeAll() {
        this.listeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.listeners = [];
    }
}

/**
 * Intersection Observer helper for lazy loading
 * @param {Function} callback - Callback when element intersects
 * @param {Object} options - Intersection observer options
 * @returns {IntersectionObserver} Observer instance
 */
export const createIntersectionObserver = (callback, options = {}) => {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

/**
 * Format currency with proper symbol and decimals
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹', decimals = 2) => {
    if (isNaN(amount)) return `${currency}0.00`;
    return `${currency}${parseFloat(amount).toFixed(decimals)}`;
};

/**
 * Parse price string to number
 * @param {string} priceString - Price string with currency symbol
 * @returns {number} Parsed price
 */
export const parsePrice = (priceString) => {
    if (typeof priceString === 'number') return priceString;
    const cleaned = String(priceString).replace(/[₹$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
};

/**
 * Deep clone object safely
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.error('Error cloning object:', error);
        return obj;
    }
};

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} Is in viewport
 */
export const isInViewport = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};
