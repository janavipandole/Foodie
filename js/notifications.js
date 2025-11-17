// ===== PUSH NOTIFICATIONS FOR ORDER UPDATES =====
const ORDER_STATUSES = {
  PLACED: 'Order Placed',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  ON_WAY: 'On the Way',
  DELIVERED: 'Delivered'
};

const ORDER_TIMINGS = {
  PREPARING: 10000, // 10 seconds after placed
  READY: 20000,     // 20 seconds after placed
  ON_WAY: 30000,    // 30 seconds after placed
  DELIVERED: 45000  // 45 seconds after placed
};

let currentOrderId = null;
let orderStatusTimeouts = [];

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      return Notification.requestPermission();
    }
    return Promise.resolve(Notification.permission);
  }
  return Promise.resolve('denied');
}

// Show push notification
function showOrderNotification(title, body, icon = '../imgs/favicon.png') {
  if ('Notification' in window && Notification.permission === 'granted') {
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

// Save order status to localStorage
function saveOrderStatus(orderId, status, timestamp) {
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

// Get order status from localStorage
function getOrderStatus(orderId) {
  const orders = JSON.parse(localStorage.getItem('foodie:orders') || '[]');
  return orders.find(o => o.id === orderId);
}

// Simulate order status progression
function startOrderTracking(orderId) {
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

// Check for existing active orders on page load
function checkExistingOrders() {
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
      // Skip to preparing status
      saveOrderStatus(latestOrder.id, ORDER_STATUSES.PREPARING, latestOrder.timestamp + ORDER_TIMINGS.PREPARING);
      startOrderTracking(latestOrder.id);
    } else if (timeElapsed < ORDER_TIMINGS.ON_WAY) {
      // Skip to ready status
      saveOrderStatus(latestOrder.id, ORDER_STATUSES.READY, latestOrder.timestamp + ORDER_TIMINGS.READY);
      startOrderTracking(latestOrder.id);
    } else if (timeElapsed < ORDER_TIMINGS.DELIVERED) {
      // Skip to on way status
      saveOrderStatus(latestOrder.id, ORDER_STATUSES.ON_WAY, latestOrder.timestamp + ORDER_TIMINGS.ON_WAY);
      startOrderTracking(latestOrder.id);
    }
  }
}

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', function() {
  checkExistingOrders();
});
