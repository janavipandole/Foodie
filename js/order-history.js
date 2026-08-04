(function () {
  'use strict';

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status) {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'out for delivery': return 'status-shipped';
      case 'preparing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
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

  function getTimelineStep(status) {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'out for delivery' || s === 'shipped') return 3;
    if (s === 'preparing' || s === 'processing') return 2;
    return 1; // Order Placed
  }

  function renderOrder(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';

    const itemsHtml = order.items.map(item => `
      <div class="order-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="order-item-details">
          <div class="order-item-name">${item.name}</div>
          <div class="order-item-quantity">Qty: ${item.quantity}</div>
        </div>
        <div class="order-item-price">₹${(item.quantity * parseFloat(String(item.price).replace(/[₹$]/g, ''))).toFixed(2)}</div>
      </div>
    `).join('');
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
        <div class="order-id">Order #${order.id}</div>
        <div class="order-status ${getStatusColor(order.status)}">${order.status}</div>
      </div>
      <div class="order-timestamp">${formatDate(order.timestamp)}</div>
      <div class="order-items">
        ${itemsHtml}
      </div>
      <div class="order-total">
        <span>Total: ₹${parseFloat(order.total || 0).toFixed(2)}</span>
      </div>
      <div class="order-card-actions" style="margin-top: 12px; display: flex; gap: 8px;">
        <button class="btn view-details-btn" style="flex: 1; padding: 8px 12px; font-size: 0.85rem;" data-order-id="${order.id}">
          <i class="fa-solid fa-receipt"></i> View Details & Track
        </button>
      </div>
    `;

    orderCard.querySelector('.view-details-btn').addEventListener('click', () => {
      openOrderModal(order);
    });
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
        <div class="order-actions" style="margin-top: 15px; text-align: right;">
            <button class="btn btn-export-pdf" data-order-id="${order.id}">
                <i class="fa-solid fa-file-pdf"></i> Export PDF
            </button>
        </div>
    `;

    const exportBtn = orderCard.querySelector('.btn-export-pdf');
    if (exportBtn && typeof html2pdf !== 'undefined') {
        exportBtn.addEventListener('click', () => {
            exportBtn.style.display = 'none'; // Hide button in PDF
            const opt = {
                margin:       10,
                filename:     `Order_${order.id}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            html2pdf().from(orderCard).set(opt).save().then(() => {
                exportBtn.style.display = 'inline-block'; // Show button again
            });
        });
    }

    return orderCard;
}

  function openOrderModal(order) {
    const modal = document.getElementById('orderDetailsModal');
    const modalBody = document.getElementById('modalOrderBody');
    if (!modal || !modalBody) return;

    const currentStep = getTimelineStep(order.status);

    const itemsRows = order.items.map(item => {
      const unitPrice = parseFloat(String(item.price).replace(/[₹$]/g, ''));
      const lineTotal = unitPrice * item.quantity;
      return `
        <tr>
          <td>${item.name}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">₹${unitPrice.toFixed(2)}</td>
          <td style="text-align: right;">₹${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const subtotal = order.items.reduce((acc, item) => acc + (parseFloat(String(item.price).replace(/[₹$]/g, '')) * item.quantity), 0);
    const tax = subtotal * 0.05;
    const deliveryFee = 30.00;
    const grandTotal = subtotal + tax + deliveryFee;

    modalBody.innerHTML = `
      <div class="receipt-header">
        <h2>Order #${order.id} Details</h2>
        <span class="order-timestamp">${formatDate(order.timestamp)}</span>
      </div>

      <!-- TRACKING TIMELINE -->
      <div class="tracking-section">
        <h3>Live Tracking Status</h3>
        <div class="timeline">
          <div class="timeline-step ${currentStep >= 1 ? 'completed' : ''}">
            <div class="step-icon"><i class="fa-solid fa-check"></i></div>
            <div class="step-label">Placed</div>
          </div>
          <div class="timeline-step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}">
            <div class="step-icon"><i class="fa-solid fa-utensils"></i></div>
            <div class="step-label">Preparing</div>
          </div>
          <div class="timeline-step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}">
            <div class="step-icon"><i class="fa-solid fa-motorcycle"></i></div>
            <div class="step-label">On the Way</div>
          </div>
          <div class="timeline-step ${currentStep >= 4 ? 'completed' : ''}">
            <div class="step-icon"><i class="fa-solid fa-house-chimney"></i></div>
            <div class="step-label">Delivered</div>
          </div>
        </div>
      </div>

      <!-- RECEIPT BREAKDOWN -->
      <div class="receipt-breakdown">
        <h3>Itemized Receipt</h3>
        <table class="receipt-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="receipt-summary">
          <div class="summary-row"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
          <div class="summary-row"><span>GST (5%):</span><span>₹${tax.toFixed(2)}</span></div>
          <div class="summary-row"><span>Delivery Fee:</span><span>₹${deliveryFee.toFixed(2)}</span></div>
          <div class="summary-row grand-total"><span>Grand Total:</span><span>₹${grandTotal.toFixed(2)}</span></div>
        </div>
      </div>

      <!-- DELIVERY INFORMATION -->
      <div class="delivery-details-box">
        <h3>Delivery Information</h3>
        <p><strong>Name:</strong> ${order.deliveryInfo?.fullName || 'Valued Customer'}</p>
        <p><strong>Address:</strong> ${order.deliveryInfo?.address || 'N/A'}, ${order.deliveryInfo?.city || ''}</p>
        <p><strong>Phone:</strong> ${order.deliveryInfo?.phone || 'N/A'}</p>
      </div>

      <!-- ACTIONS -->
      <div class="modal-actions">
        <button id="reorderBtn" class="btn"><i class="fa-solid fa-arrows-rotate"></i> Re-order Items</button>
        <button id="printReceiptBtn" class="btn btn-secondary"><i class="fa-solid fa-print"></i> Print Receipt</button>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('reorderBtn').addEventListener('click', () => {
      const currentCart = JSON.parse(localStorage.getItem('foodie:cart') || '[]');
      order.items.forEach(item => {
        const existing = currentCart.find(i => i.name === item.name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          currentCart.push({ ...item });
        }
      });
      localStorage.setItem('foodie:cart', JSON.stringify(currentCart));
      alert('Items re-added to your cart!');
      window.location.href = './checkout.html';
    });

    document.getElementById('printReceiptBtn').addEventListener('click', () => {
      window.print();
    });
  }

  function loadOrders() {
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
    const modal = document.getElementById('orderDetailsModal');
    const closeBtn = document.getElementById('closeOrderModal');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }

    if (!ordersList || !emptyMessage) return orders;

    if (orders.length === 0) {
        emptyMessage.style.display = 'block';
        ordersList.style.display = 'none';
        return orders;
    }

    emptyMessage.style.display = 'none';
    ordersList.style.display = 'grid';

    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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

  document.addEventListener('DOMContentLoaded', loadOrders);
})();
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
