/**
 * Error Handling Module
 * Provides comprehensive error handling, logging, and recovery mechanisms
 */

// ===== ERROR TYPES =====
const ErrorTypes = {
    NETWORK: 'NetworkError',
    VALIDATION: 'ValidationError',
    STORAGE: 'StorageError',
    DOM: 'DOMError',
    CART: 'CartError',
    AUTH: 'AuthError',
    UNKNOWN: 'UnknownError'
};

// ===== CUSTOM ERROR CLASSES =====

class FoodieError extends Error {
    constructor(message, type = ErrorTypes.UNKNOWN, details = {}) {
        super(message);
        this.name = 'FoodieError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class NetworkError extends FoodieError {
    constructor(message, details = {}) {
        super(message, ErrorTypes.NETWORK, details);
        this.name = 'NetworkError';
    }
}

class ValidationError extends FoodieError {
    constructor(message, details = {}) {
        super(message, ErrorTypes.VALIDATION, details);
        this.name = 'ValidationError';
    }
}

class StorageError extends FoodieError {
    constructor(message, details = {}) {
        super(message, ErrorTypes.STORAGE, details);
        this.name = 'StorageError';
    }
}

// ===== ERROR LOGGER =====

class ErrorLogger {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // Keep last 50 errors
        this.listeners = [];
    }
    
    log(error, context = {}) {
        const errorEntry = {
            message: error.message,
            type: error.type || ErrorTypes.UNKNOWN,
            name: error.name,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errors.push(errorEntry);
        
        // Keep only last maxErrors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Notify listeners
        this.listeners.forEach(listener => {
            try {
                listener(errorEntry);
            } catch (e) {
                console.error('Error in error listener:', e);
            }
        });
        
        // Log to console in development
        if (this.isDevelopment()) {
            console.error('Error logged:', errorEntry);
        }
        
        // Store in localStorage for debugging
        this.persistErrors();
        
        return errorEntry;
    }
    
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }
    
    getErrors(type = null) {
        if (type) {
            return this.errors.filter(e => e.type === type);
        }
        return [...this.errors];
    }
    
    clearErrors() {
        this.errors = [];
        this.persistErrors();
    }
    
    persistErrors() {
        try {
            const recentErrors = this.errors.slice(-10); // Store last 10
            localStorage.setItem('foodie:errors', JSON.stringify(recentErrors));
        } catch (e) {
            console.warn('Could not persist errors:', e);
        }
    }
    
    loadPersistedErrors() {
        try {
            const stored = localStorage.getItem('foodie:errors');
            if (stored) {
                this.errors = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not load persisted errors:', e);
        }
    }
    
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }
    
    exportErrors() {
        return JSON.stringify(this.errors, null, 2);
    }
}

// Global error logger instance
const errorLogger = new ErrorLogger();
errorLogger.loadPersistedErrors();

// ===== ERROR HANDLERS =====

/**
 * Handle localStorage errors gracefully
 */
const handleStorageError = (operation, key, error) => {
    const storageError = new StorageError(
        `Failed to ${operation} localStorage key: ${key}`,
        { operation, key, originalError: error.message }
    );
    
    errorLogger.log(storageError);
    
    // Show user-friendly message
    showErrorToast('Storage error. Your data may not be saved.');
    
    return null;
};

/**
 * Handle network errors
 */
const handleNetworkError = (url, error) => {
    const networkError = new NetworkError(
        `Network request failed: ${url}`,
        { url, originalError: error.message }
    );
    
    errorLogger.log(networkError);
    
    // Show user-friendly message
    showErrorToast('Network error. Please check your connection.');
    
    return null;
};

/**
 * Handle validation errors
 */
const handleValidationError = (field, message) => {
    const validationError = new ValidationError(
        `Validation failed for ${field}: ${message}`,
        { field, message }
    );
    
    errorLogger.log(validationError);
    
    // Show field-specific error
    showFieldError(field, message);
    
    return false;
};

/**
 * Handle DOM errors
 */
const handleDOMError = (selector, operation, error) => {
    const domError = new FoodieError(
        `DOM operation failed: ${operation} on ${selector}`,
        ErrorTypes.DOM,
        { selector, operation, originalError: error.message }
    );
    
    errorLogger.log(domError);
    
    return null;
};

/**
 * Handle cart errors
 */
const handleCartError = (operation, productId, error) => {
    const cartError = new FoodieError(
        `Cart operation failed: ${operation} for product ${productId}`,
        ErrorTypes.CART,
        { operation, productId, originalError: error.message }
    );
    
    errorLogger.log(cartError);
    
    showErrorToast('Cart error. Please try again.');
    
    return false;
};

// ===== SAFE WRAPPERS =====

/**
 * Safe localStorage wrapper
 */
const safeLocalStorage = {
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : defaultValue;
        } catch (error) {
            return handleStorageError('read', key, error) || defaultValue;
        }
    },
    
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            handleStorageError('write', key, error);
            return false;
        }
    },
    
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            handleStorageError('remove', key, error);
            return false;
        }
    }
};

/**
 * Safe DOM query
 */
const safeQuery = (selector, parent = document) => {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        handleDOMError(selector, 'querySelector', error);
        return null;
    }
};

/**
 * Safe DOM query all
 */
const safeQueryAll = (selector, parent = document) => {
    try {
        return Array.from(parent.querySelectorAll(selector));
    } catch (error) {
        handleDOMError(selector, 'querySelectorAll', error);
        return [];
    }
};

/**
 * Safe fetch wrapper
 */
const safeFetch = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        return handleNetworkError(url, error);
    }
};

/**
 * Safe JSON parse
 */
const safeJSONParse = (jsonString, defaultValue = null) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        errorLogger.log(new FoodieError(
            'JSON parse failed',
            ErrorTypes.UNKNOWN,
            { jsonString: jsonString?.substring(0, 100), error: error.message }
        ));
        return defaultValue;
    }
};

// ===== ERROR RECOVERY =====

/**
 * Retry mechanism for failed operations
 */
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }
            
            errorLogger.log(new FoodieError(
                `Retry attempt ${attempt} failed`,
                ErrorTypes.UNKNOWN,
                { attempt, maxAttempts, error: error.message }
            ));
            
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
};

/**
 * Circuit breaker pattern for failing operations
 */
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.failureCount = 0;
        this.threshold = threshold;
        this.timeout = timeout;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.nextAttempt = Date.now();
    }
    
    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new FoodieError('Circuit breaker is OPEN', ErrorTypes.NETWORK);
            }
            this.state = 'HALF_OPEN';
        }
        
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    
    onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
            errorLogger.log(new FoodieError(
                'Circuit breaker opened',
                ErrorTypes.NETWORK,
                { failureCount: this.failureCount, threshold: this.threshold }
            ));
        }
    }
}

// ===== UI ERROR DISPLAY =====

/**
 * Show error toast notification
 */
const showErrorToast = (message, duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = 'toast error-toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>${escapeHTML(message)}</span>
    `;
    
    const container = document.querySelector('.toast-container') || document.body;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

/**
 * Show field-specific error
 */
const showFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove existing error
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
    
    // Add error class to field
    field.classList.add('error');
    
    // Remove error on input
    field.addEventListener('input', () => {
        field.classList.remove('error');
        errorDiv.remove();
    }, { once: true });
};

/**
 * Escape HTML to prevent XSS
 */
const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// ===== GLOBAL ERROR HANDLERS =====

/**
 * Handle uncaught errors
 */
window.addEventListener('error', (event) => {
    errorLogger.log(new FoodieError(
        event.message,
        ErrorTypes.UNKNOWN,
        {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
        }
    ));
    
    // Prevent default error handling in production
    if (!errorLogger.isDevelopment()) {
        event.preventDefault();
        showErrorToast('An error occurred. Please refresh the page.');
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log(new FoodieError(
        event.reason?.message || 'Unhandled promise rejection',
        ErrorTypes.UNKNOWN,
        { reason: event.reason }
    ));
    
    if (!errorLogger.isDevelopment()) {
        event.preventDefault();
        showErrorToast('An error occurred. Please try again.');
    }
});

// ===== EXPORTS =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ErrorTypes,
        FoodieError,
        NetworkError,
        ValidationError,
        StorageError,
        errorLogger,
        handleStorageError,
        handleNetworkError,
        handleValidationError,
        handleDOMError,
        handleCartError,
        safeLocalStorage,
        safeQuery,
        safeQueryAll,
        safeFetch,
        safeJSONParse,
        retry,
        CircuitBreaker,
        showErrorToast,
        showFieldError
    };
}
