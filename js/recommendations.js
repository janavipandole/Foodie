(function () {
  'use strict';

  const ORDERS_KEY = 'foodie:orders';
  const CART_KEY = 'foodie:cart';
  const PRODUCTS_PATH = '../products.json';
  const MAX_RECS = 4;

  function getMostFrequentCuisine(orders) {
    const freq = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (item.cuisine) freq[item.cuisine] = (freq[item.cuisine] || 0) + (item.quantity || 1);
      });
    });
    if (!Object.keys(freq).length) return null;
    return Object.keys(freq).reduce((a, b) => freq[a] >= freq[b] ? a : b);
  }

  function getOrderedItemIds(orders) {
    const ids = new Set();
    orders.forEach(o => (o.items || []).forEach(i => ids.add(i.id)));
    return ids;
  }

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (_) { return []; }
  }

  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) {}
  }

  function addToCartLocal(product) {
    const cart = loadCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    }
    saveCart(cart);

    // Sync with app.js cart if loaded on same page
    if (typeof addProduct !== 'undefined' && typeof addToCart === 'function') {
      const dummyCard = document.createElement('div');
      addToCart(product, dummyCard);
    }
  }

  function showToastLocal(msg) {
    if (typeof showToast === 'function') { showToast(msg); return; }
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--gold-finger);color:var(--lead);padding:.8rem 1.4rem;border-radius:1rem;z-index:9999;font-size:1rem;box-shadow:0 4px 12px rgba(0,0,0,.2);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  function buildCard(product) {
    const card = document.createElement('div');
    card.className = 'order-card rec-card';
    card.innerHTML = `
      <div class="rating"><i class="fa-solid fa-star"></i> ${product.rating || 'N/A'}</div>
      <div class="card-image"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>
      <h4>${product.name}</h4>
      <h4 class="price">₹${parseFloat(product.price).toFixed(2)}</h4>
      <div class="card-btn-container">
        <a href="#" class="btn card-btn">Add to Cart</a>
      </div>
    `;
    card.querySelector('.card-btn').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      addToCartLocal(product);
      showToastLocal(`${product.name} added to cart`);
      // Update cart count badge if present
      const badge = document.querySelector('.cart-value, .cart-count');
      if (badge) {
        const cart = loadCart();
        badge.textContent = cart.reduce((s, i) => s + (i.quantity || 1), 0);
      }
    });
    return card;
  }

  async function init() {
    const section = document.getElementById('recommendations');
    if (!section) return;

    const orders = (() => { try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (_) { return []; } })();

    let products;
    try {
      const res = await fetch(PRODUCTS_PATH);
      products = await res.json();
    } catch (_) { return; }

    const grid = section.querySelector('.rec-grid');
    const heading = section.querySelector('.rec-heading');

    let picks;

    if (orders.length === 0) {
      // Fallback: top-rated items
      picks = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, MAX_RECS);
      if (heading) heading.textContent = 'Most Popular';
    } else {
      const cuisine = getMostFrequentCuisine(orders);
      const orderedIds = getOrderedItemIds(orders);
      let pool = cuisine ? products.filter(p => p.cuisine === cuisine && !orderedIds.has(p.id)) : [];
      // If not enough, fill with top-rated from same cuisine (including already ordered)
      if (pool.length < MAX_RECS && cuisine) pool = products.filter(p => p.cuisine === cuisine);
      // Still not enough — fall back to top-rated overall
      if (pool.length < MAX_RECS) pool = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      picks = pool.slice(0, MAX_RECS);
      if (heading && cuisine) heading.textContent = `Recommended for You · ${cuisine} Picks`;
    }

    if (!picks.length) { section.style.display = 'none'; return; }

    grid.innerHTML = '';
    picks.forEach(p => grid.appendChild(buildCard(p)));
    section.style.display = '';
  }

  document.addEventListener('DOMContentLoaded', init);
})();
