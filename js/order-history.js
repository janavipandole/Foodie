/**
 * Order History Module
 * Manages fetching, sorting, date formatting, status badge styling, and rendering of user order history.
 */

/**
 * Formats an ISO date string into a readable Indian locale format.
 * @param {string} isoString - Date string to format
 * @returns {string} Formatted date string
 */
export function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return String(isoString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return String(isoString);
    }
}

/**
 * Maps order status strings to appropriate UI color classes.
 * @param {string} status - Order status
 * @returns {string} Status class name
 */
export function getStatusColor(status) {
    if (!status || typeof status !== 'string') return 'status-pending';
    switch (status.toLowerCase().trim()) {
        case 'delivered':
            return 'status-delivered';
        case 'pending':
            return 'status-pending';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return 'status-pending';
    }
}

/**
 * Renders a single order card element.
 * @param {Object} order - Order object containing items, total, status, and timestamp
 * @returns {HTMLElement|string} Rendered order card element or HTML string
 */
export function renderOrder(order) {
    const statusClass = getStatusColor(order.status);
    const formattedDate = formatDate(order.timestamp);

    const itemsHtml = (order.items || []).map(item => {
        const parsedPrice = parseFloat(String(item.price || '0').replace(/[₹$]/g, '')) || 0;
        const itemTotal = (item.quantity || 1) * parsedPrice;
        return `
            <div class="order-item">
                <img src="${item.image || ''}" alt="${item.name || 'Item'}">
                <div class="order-item-details">
                    <div class="order-item-name">${item.name || 'Product'}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity || 1}</div>
                </div>
                <div class="order-item-price">₹${itemTotal.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    const totalAmount = Number.isFinite(order.total) ? order.total.toFixed(2) : '0.00';

    if (typeof document === 'undefined') {
        return `<div class="order-card">
            <div class="order-header">
                <div class="order-id">Order #${order.id || 'N/A'}</div>
                <div class="order-status ${statusClass}">${order.status || 'Unknown'}</div>
            </div>
            <div class="order-timestamp">${formattedDate}</div>
            <div class="order-items">${itemsHtml}</div>
            <div class="order-total"><span>Total: ₹${totalAmount}</span></div>
        </div>`;
    }

    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.innerHTML = `
        <div class="order-header">
            <div class="order-id">Order #${order.id || 'N/A'}</div>
            <div class="order-status ${statusClass}">${order.status || 'Unknown'}</div>
        </div>
        <div class="order-timestamp">${formattedDate}</div>
        <div class="order-items">
            ${itemsHtml}
        </div>
        <div class="order-total">
            <span>Total: ₹${totalAmount}</span>
        </div>
        ${order.deliveryInfo ? `
        <div class="order-delivery-info">
            <h4>Delivery Details</h4>
            <p><strong>${order.deliveryInfo.fullName || ''}</strong></p>
            <p>${order.deliveryInfo.address || ''}</p>
            <p>${order.deliveryInfo.city || ''}, ${order.deliveryInfo.zipCode || ''}</p>
            <p>${order.deliveryInfo.phone || ''}</p>
            <p>${order.deliveryInfo.email || ''}</p>
            ${order.deliveryInfo.notes ? `<p><em>${order.deliveryInfo.notes}</em></p>` : ''}
        </div>` : ''}
    `;

    return orderCard;
}

/**
 * Loads orders from localStorage and populates the order history DOM container.
 * @returns {Array} Loaded and sorted orders array
 */
export function loadOrders() {
    if (typeof localStorage === 'undefined') return [];
    const orders = JSON.parse(localStorage.getItem('foodie:orders') || '[]');
    
    if (typeof document === 'undefined') return orders;

    const ordersList = document.getElementById('ordersList');
    const emptyMessage = document.getElementById('emptyOrdersMessage');

    if (!ordersList || !emptyMessage) return orders;

    if (orders.length === 0) {
        emptyMessage.style.display = 'block';
        ordersList.style.display = 'none';
        return orders;
    }

    emptyMessage.style.display = 'none';
    ordersList.style.display = 'grid';

    // Sort orders by timestamp (most recent first)
    orders.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    ordersList.innerHTML = '';
    orders.forEach(order => {
        const card = renderOrder(order);
        if (card instanceof HTMLElement) {
            ordersList.appendChild(card);
        } else if (typeof card === 'string') {
            ordersList.insertAdjacentHTML('beforeend', card);
        }
    });

    return orders;
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', loadOrders);
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.formatDate = formatDate;
    window.getStatusColor = getStatusColor;
    window.renderOrder = renderOrder;
    window.loadOrders = loadOrders;
    window.orderHistoryModule = {
        formatDate,
        getStatusColor,
        renderOrder,
        loadOrders
    };
}
