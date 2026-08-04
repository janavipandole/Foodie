/**
 * Error Handling Module
 * Provides comprehensive error handling, logging, and recovery mechanisms
 */

// ===== ERROR TYPES =====
export const ErrorTypes = {
    NETWORK: 'NetworkError',
    VALIDATION: 'ValidationError',
    STORAGE: 'StorageError',
    DOM: 'DOMError',
    CART: 'CartError',
    AUTH: 'AuthError',
    UNKNOWN: 'UnknownError'
};

// ===== CUSTOM ERROR CLASSES =====

export class FoodieError extends Error {
    constructor(message, type = ErrorTypes.UNKNOWN, details = {}) {
        super(message);
        this.name = 'FoodieError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

export class NetworkError extends FoodieError {
    constructor(message, details = {}) {
        super(message, ErrorTypes.NETWORK, details);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends FoodieError {
    constructor(message, details = {}) {
        super(message, ErrorTypes.VALIDATION, details);
        this.name = 'ValidationError';
    }
}

export class StorageError extends FoodieError {
    constructor(message, details = {}) {
        super(message, ErrorTypes.STORAGE, details);
        this.name = 'StorageError';
    }
}

// ===== ERROR LOGGER =====

export class ErrorLogger {
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
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            url: typeof window !== 'undefined' ? window.location.href : ''
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
            if (typeof localStorage !== 'undefined') {
                const recentErrors = this.errors.slice(-10); // Store last 10
                localStorage.setItem('foodie:errors', JSON.stringify(recentErrors));
            }
        } catch (e) {
            console.warn('Could not persist errors:', e);
        }
    }
    
    loadPersistedErrors() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('foodie:errors');
                if (stored) {
                    this.errors = JSON.parse(stored);
                }
            }
        } catch (e) {
            console.warn('Could not load persisted errors:', e);
        }
    }
    
    isDevelopment() {
        if (typeof window === 'undefined') return false;
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }
    
    exportErrors() {
        return JSON.stringify(this.errors, null, 2);
    }
}

// Global error logger instance
export const errorLogger = new ErrorLogger();
errorLogger.loadPersistedErrors();

// ===== ERROR HANDLERS =====

/**
 * Handle localStorage errors gracefully
 */
export const handleStorageError = (operation, key, error) => {
    const storageError = new StorageError(
        `Failed to ${operation} localStorage key: ${key}`,
        { operation, key, originalError: error.message }
    );
    
    errorLogger.log(storageError);
    
    // Show user-friendly message
    const msg = typeof t === 'function' ? t('errors.storage', 'Storage error. Your data may not be saved.') : 'Storage error. Your data may not be saved.';
    showErrorToast(msg);
    
    return null;
};

/**
 * Handle network errors
 */
export const handleNetworkError = (url, error) => {
    const networkError = new NetworkError(
        `Network request failed: ${url}`,
        { url, originalError: error.message }
    );
    
    errorLogger.log(networkError);
    
    // Show user-friendly message
    const msg = typeof t === 'function' ? t('errors.network', 'Network error. Please check your connection.') : 'Network error. Please check your connection.';
    showErrorToast(msg);
    
    return null;
};

/**
 * Handle validation errors
 */
export const handleValidationError = (field, message) => {
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
export const handleDOMError = (selector, operation, error) => {
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
export const handleCartError = (operation, productId, error) => {
    const cartError = new FoodieError(
        `Cart operation failed: ${operation} for product ${productId}`,
        ErrorTypes.CART,
        { operation, productId, originalError: error.message }
    );
    
    errorLogger.log(cartError);
    
    const msg = typeof t === 'function' ? t('errors.cart', 'Cart error. Please try again.') : 'Cart error. Please try again.';
    showErrorToast(msg);
    
    return false;
};

// ===== SAFE WRAPPERS =====

/**
 * Safe localStorage wrapper
 */
export const safeLocalStorage = {
    getItem(key, defaultValue = null) {
        try {
            if (typeof localStorage === 'undefined') return defaultValue;
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : defaultValue;
        } catch (error) {
            return handleStorageError('read', key, error) || defaultValue;
        }
    },
    
    setItem(key, value) {
        try {
            if (typeof localStorage === 'undefined') return false;
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            handleStorageError('write', key, error);
            return false;
        }
    },
    
    removeItem(key) {
        try {
            if (typeof localStorage === 'undefined') return false;
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
export const safeQuery = (selector, parent = typeof document !== 'undefined' ? document : null) => {
    try {
        if (!parent) return null;
        return parent.querySelector(selector);
    } catch (error) {
        handleDOMError(selector, 'querySelector', error);
        return null;
    }
};

/**
 * Safe DOM query all
 */
export const safeQueryAll = (selector, parent = typeof document !== 'undefined' ? document : null) => {
    try {
        if (!parent) return [];
        return Array.from(parent.querySelectorAll(selector));
    } catch (error) {
        handleDOMError(selector, 'querySelectorAll', error);
        return [];
    }
};

/**
 * Safe fetch wrapper
 */
export const safeFetch = async (url, options = {}) => {
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
export const safeJSONParse = (jsonString, defaultValue = null) => {
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
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
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
export class CircuitBreaker {
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
export const showErrorToast = (message, duration = 3000) => {
    if (typeof document === 'undefined') return;
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
export const showFieldError = (fieldId, message) => {
    if (typeof document === 'undefined') return;
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
export const escapeHTML = (str) => {
    if (typeof document === 'undefined') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// ===== GLOBAL ERROR HANDLERS =====

if (typeof window !== 'undefined') {
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
            const msg = typeof t === 'function' ? t('errors.unhandled', 'An error occurred. Please refresh the page.') : 'An error occurred. Please refresh the page.';
            showErrorToast(msg);
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
            const msg = typeof t === 'function' ? t('errors.promiseRejected', 'An error occurred. Please try again.') : 'An error occurred. Please try again.';
            showErrorToast(msg);
        }
    });
}

// Global Export for browser modules
if (typeof window !== 'undefined') {
    window.FoodieErrorHandler = {
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
