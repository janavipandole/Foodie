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
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
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
        <div class="order-item-price">₹${(item.quantity * parseFloat(item.price.replace(/[₹$]/g, ''))).toFixed(2)}</div>
      </div>
    `).join('');

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
        <span>Total: ₹${order.total.toFixed(2)}</span>
      </div>
      <div class="order-delivery-info">
        <h4>Delivery Details</h4>
        <p><strong>${order.deliveryInfo.fullName}</strong></p>
        <p>${order.deliveryInfo.address}</p>
        <p>${order.deliveryInfo.city}, ${order.deliveryInfo.zipCode}</p>
        <p>${order.deliveryInfo.phone}</p>
        <p>${order.deliveryInfo.email}</p>
        ${order.deliveryInfo.notes ? `<p><em>${order.deliveryInfo.notes}</em></p>` : ''}
      </div>
    `;

    return orderCard;
  }

  function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('foodie:orders') || '[]');
    const ordersList = document.getElementById('ordersList');
    const emptyMessage = document.getElementById('emptyOrdersMessage');

    if (orders.length === 0) {
      emptyMessage.style.display = 'block';
      ordersList.style.display = 'none';
      return;
    }

    emptyMessage.style.display = 'none';
    ordersList.style.display = 'grid';

    // Sort orders by timestamp (most recent first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    ordersList.innerHTML = '';
    orders.forEach(order => {
      ordersList.appendChild(renderOrder(order));
    });
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', loadOrders);
})();
