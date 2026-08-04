/**
 * Push Notifications & Order Tracking Module
 * Manages notification permissions, push alerts, status progressions, and active order recovery.
 */

export const ORDER_STATUSES = {
    PLACED: 'Order Placed',
    PREPARING: 'Preparing',
    READY: 'Ready for Pickup',
    ON_WAY: 'On the Way',
    DELIVERED: 'Delivered'
};

export const ORDER_TIMINGS = {
    PREPARING: 10000, // 10 seconds after placed
    READY: 20000,     // 20 seconds after placed
    ON_WAY: 30000,    // 30 seconds after placed
    DELIVERED: 45000  // 45 seconds after placed
};

let currentOrderId = null;
let orderStatusTimeouts = [];

/**
 * Requests browser notification permission from the user.
 * @returns {Promise<string>} Permission status string ('granted', 'denied', 'default')
 */
export function requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
            return Notification.requestPermission();
        }
        return Promise.resolve(Notification.permission);
    }
    return Promise.resolve('denied');
}

/**
 * Displays a push notification to the user if permission is granted.
 * @param {string} title - Notification title
 * @param {string} body - Notification body message
 * @param {string} icon - Icon URL path
 * @returns {Notification|null} Notification instance or null
 */
export function showOrderNotification(title, body, icon = '../imgs/favicon.png') {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: icon,
            badge: '../imgs/favicon.png',
            tag: 'foodie-order-update',
            requireInteraction: false,
            silent: false
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Handle click
        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        return notification;
    }
    return null;
}

/**
 * Saves or updates order status details in localStorage.
 * @param {string|number} orderId - Order identifier
 * @param {string} status - Current order status
 * @param {number} timestamp - Order timestamp
 */
export function saveOrderStatus(orderId, status, timestamp) {
    if (typeof localStorage === 'undefined') return;
    const orders = JSON.parse(localStorage.getItem('foodie:orders') || '[]');
    const existingOrderIndex = orders.findIndex(o => o.id === orderId);

    const orderData = {
        id: orderId,
        status: status,
        timestamp: timestamp,
        lastUpdate: Date.now()
    };

    if (existingOrderIndex >= 0) {
        orders[existingOrderIndex] = orderData;
    } else {
        orders.push(orderData);
    }

    localStorage.setItem('foodie:orders', JSON.stringify(orders));
}

/**
 * Retrieves order status details from localStorage.
 * @param {string|number} orderId - Order identifier
 * @returns {Object|undefined} Order data object
 */
export function getOrderStatus(orderId) {
    if (typeof localStorage === 'undefined') return undefined;
    const orders = JSON.parse(localStorage.getItem('foodie:orders') || '[]');
    return orders.find(o => o.id === orderId);
}

/**
 * Simulates order status progression and triggers notifications over time.
 * @param {string|number} orderId - Order identifier
 */
export function startOrderTracking(orderId) {
    currentOrderId = orderId;
    const startTime = Date.now();

    // Clear any existing timeouts
    orderStatusTimeouts.forEach(timeout => clearTimeout(timeout));
    orderStatusTimeouts = [];

    // Initial status
    saveOrderStatus(orderId, ORDER_STATUSES.PLACED, startTime);
    showOrderNotification(
        'Order Confirmed! 🎉',
        `Your order ${orderId} has been placed successfully. We'll start preparing it soon.`,
        '../imgs/favicon.png'
    );

    // Status progression
    orderStatusTimeouts.push(setTimeout(() => {
        saveOrderStatus(orderId, ORDER_STATUSES.PREPARING, Date.now());
        showOrderNotification(
            'Order Update 🍳',
            `Your order ${orderId} is now being prepared. Our chefs are working their magic!`
        );
    }, ORDER_TIMINGS.PREPARING));

    orderStatusTimeouts.push(setTimeout(() => {
        saveOrderStatus(orderId, ORDER_STATUSES.READY, Date.now());
        showOrderNotification(
            'Order Ready! 📦',
            `Your order ${orderId} is ready for pickup. Our delivery partner will be with you soon.`
        );
    }, ORDER_TIMINGS.READY));

    orderStatusTimeouts.push(setTimeout(() => {
        saveOrderStatus(orderId, ORDER_STATUSES.ON_WAY, Date.now());
        showOrderNotification(
            'Order On The Way! 🚚',
            `Great news! Your order ${orderId} is on the way. Track your delivery in real-time.`
        );
    }, ORDER_TIMINGS.ON_WAY));

    orderStatusTimeouts.push(setTimeout(() => {
        saveOrderStatus(orderId, ORDER_STATUSES.DELIVERED, Date.now());
        showOrderNotification(
            'Order Delivered! ✅',
            `Your order ${orderId} has been delivered successfully. Enjoy your meal!`
        );
    }, ORDER_TIMINGS.DELIVERED));
}

/**
 * Checks for existing active orders on page load and resumes tracking.
 */
export function checkExistingOrders() {
    if (typeof localStorage === 'undefined') return;
    const orders = JSON.parse(localStorage.getItem('foodie:orders') || '[]');
    const activeOrders = orders.filter(order => {
        const timeSinceUpdate = Date.now() - order.lastUpdate;
        return timeSinceUpdate < ORDER_TIMINGS.DELIVERED && order.status !== ORDER_STATUSES.DELIVERED;
    });

    if (activeOrders.length > 0) {
        // Resume tracking for the most recent active order
        const latestOrder = activeOrders.sort((a, b) => b.timestamp - a.timestamp)[0];
        const timeElapsed = Date.now() - latestOrder.timestamp;

        // Calculate next status based on time elapsed
        if (timeElapsed < ORDER_TIMINGS.PREPARING) {
            startOrderTracking(latestOrder.id);
        } else if (timeElapsed < ORDER_TIMINGS.READY) {
            saveOrderStatus(latestOrder.id, ORDER_STATUSES.PREPARING, latestOrder.timestamp + ORDER_TIMINGS.PREPARING);
            startOrderTracking(latestOrder.id);
        } else if (timeElapsed < ORDER_TIMINGS.ON_WAY) {
            saveOrderStatus(latestOrder.id, ORDER_STATUSES.READY, latestOrder.timestamp + ORDER_TIMINGS.READY);
            startOrderTracking(latestOrder.id);
        } else if (timeElapsed < ORDER_TIMINGS.DELIVERED) {
            saveOrderStatus(latestOrder.id, ORDER_STATUSES.ON_WAY, latestOrder.timestamp + ORDER_TIMINGS.ON_WAY);
            startOrderTracking(latestOrder.id);
        }
    }
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        checkExistingOrders();
    });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.requestNotificationPermission = requestNotificationPermission;
    window.showOrderNotification = showOrderNotification;
    window.saveOrderStatus = saveOrderStatus;
    window.getOrderStatus = getOrderStatus;
    window.startOrderTracking = startOrderTracking;
    window.checkExistingOrders = checkExistingOrders;
    window.notificationsModule = {
        ORDER_STATUSES,
        ORDER_TIMINGS,
        requestNotificationPermission,
        showOrderNotification,
        saveOrderStatus,
        getOrderStatus,
        startOrderTracking,
        checkExistingOrders
    };
}
