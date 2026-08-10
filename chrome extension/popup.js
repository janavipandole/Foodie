document.addEventListener("DOMContentLoaded", () => {
  const openAppBtn = document.getElementById("openAppBtn");
  const trackOrdersBtn = document.getElementById("trackOrdersBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const themeToggle = document.getElementById("themeToggle");

  const orderBadge = document.getElementById("orderBadge");
  const orderIdText = document.getElementById("orderIdText");
  const orderEtaText = document.getElementById("orderEtaText");
  const orderProgressBar = document.getElementById("orderProgressBar");

  const cartCountBadge = document.getElementById("cartCountBadge");
  const cartTotalText = document.getElementById("cartTotalText");

  // Handle open app click
  if (openAppBtn) {
    openAppBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: "https://hacktoberfest2025-foodie-rho.vercel.app/" });
    });
  }

  if (trackOrdersBtn) {
    trackOrdersBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: "https://hacktoberfest2025-foodie-rho.vercel.app/html/order-history.html" });
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem('foodie:cart');
      } catch (e) {}
      updateCartSummary([]);
    });
  }

  // Handle dark mode toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark-theme");
      themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });
  }

  // Load state from local storage or Chrome storage
  loadExtensionState();

  function loadExtensionState() {
    let orders = [];
    let cart = [];

    try {
      orders = JSON.parse(localStorage.getItem('foodie:orders') || '[]');
      cart = JSON.parse(localStorage.getItem('foodie:cart') || '[]');
    } catch (e) {}

    updateOrderStatus(orders[0]);
    updateCartSummary(cart);
  }

  function updateOrderStatus(latestOrder) {
    if (!latestOrder) {
      orderBadge.textContent = "No Orders";
      orderBadge.className = "badge status-none";
      orderIdText.textContent = "No active orders found";
      orderEtaText.textContent = "Order delicious food now!";
      orderProgressBar.style.width = "0%";
      return;
    }

    orderIdText.textContent = `Order #${latestOrder.id}`;
    const status = (latestOrder.status || 'Pending').toLowerCase();

    if (status === 'delivered') {
      orderBadge.textContent = "Delivered";
      orderBadge.className = "badge status-delivered";
      orderEtaText.textContent = "Order Delivered Enjoy your meal!";
      orderProgressBar.style.width = "100%";
    } else if (status === 'out for delivery' || status === 'shipped') {
      orderBadge.textContent = "On the Way";
      orderBadge.className = "badge status-shipped";
      orderEtaText.textContent = "ETA: ~15 mins away";
      orderProgressBar.style.width = "75%";
    } else if (status === 'preparing') {
      orderBadge.textContent = "Preparing";
      orderBadge.className = "badge status-processing";
      orderEtaText.textContent = "ETA: ~30 mins away";
      orderProgressBar.style.width = "40%";
    } else {
      orderBadge.textContent = "Order Placed";
      orderBadge.className = "badge status-pending";
      orderEtaText.textContent = "ETA: ~45 mins away";
      orderProgressBar.style.width = "15%";
    }
  }

  function updateCartSummary(cartItems) {
    const totalCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const totalPrice = cartItems.reduce((acc, item) => {
      const price = parseFloat(String(item.price || 0).replace(/[₹$]/g, ''));
      return acc + (price * (item.quantity || 1));
    }, 0);

    cartCountBadge.textContent = `${totalCount} ${totalCount === 1 ? 'Item' : 'Items'}`;
    cartTotalText.textContent = `₹${totalPrice.toFixed(2)}`;
  }
});
