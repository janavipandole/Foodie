/**
 * Recommendations Module
 * Manages order analysis, frequency calculation, cart synchronization, recommendation pools, and rendering.
 */

export const ORDERS_KEY = 'foodie:orders';
export const CART_KEY = 'foodie:cart';
export const PRODUCTS_PATH = '../products.json';
export const MAX_RECS = 4;

/**
 * Calculates the most frequently ordered cuisine from user order history.
 * @param {Array} orders - Array of past order objects
 * @returns {string|null} Most frequent cuisine name or null
 */
export function getMostFrequentCuisine(orders) {
    if (!Array.isArray(orders)) return null;
    const freq = {};
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            if (item.cuisine) {
                freq[item.cuisine] = (freq[item.cuisine] || 0) + (item.quantity || 1);
            }
        });
    });
    const keys = Object.keys(freq);
    if (!keys.length) return null;
    return keys.reduce((a, b) => freq[a] >= freq[b] ? a : b);
}

/**
 * Extracts a Set of item IDs that the user has already ordered.
 * @param {Array} orders - Array of past order objects
 * @returns {Set<string|number>} Set of ordered item IDs
 */
export function getOrderedItemIds(orders) {
    const ids = new Set();
    if (!Array.isArray(orders)) return ids;
    orders.forEach(o => (o.items || []).forEach(i => {
        if (i.id !== undefined) ids.add(i.id);
    }));
    return ids;
}

/**
 * Loads the cart from localStorage safely.
 * @returns {Array} Cart items array
 */
export function loadCart() {
    if (typeof localStorage === 'undefined') return [];
    try { 
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); 
    } catch (_) { 
        return []; 
    }
}

/**
 * Saves the cart to localStorage safely.
 * @param {Array} cart - Cart items array
 */
export function saveCart(cart) {
    if (typeof localStorage === 'undefined') return;
    try { 
        localStorage.setItem(CART_KEY, JSON.stringify(cart)); 
    } catch (_) {}
}

/**
 * Adds a product locally to the cart and triggers app sync if available.
 * @param {Object} product - Product object to add
 */
export function addToCartLocal(product) {
    const cart = loadCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    }
    saveCart(cart);

    // Sync with app.js cart if loaded on same page
    if (typeof window !== 'undefined' && typeof window.addProduct !== 'undefined' && typeof window.addToCart === 'function') {
        const dummyCard = document.createElement('div');
        window.addToCart(product, dummyCard);
    }
}

/**
 * Displays a local toast notification.
 * @param {string} msg - Message to display
 */
export function showToastLocal(msg) {
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') { 
        window.showToast(msg); 
        return; 
    }
    if (typeof document === 'undefined') return;
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--gold-finger);color:var(--lead);padding:.8rem 1.4rem;border-radius:1rem;z-index:9999;font-size:1rem;box-shadow:0 4px 12px rgba(0,0,0,.2);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

/**
 * Builds a recommendation product card DOM element.
 * @param {Object} product - Product object
 * @returns {HTMLElement} Product card element
 */
export function buildCard(product) {
    if (typeof document === 'undefined') return null;
    const card = document.createElement('div');
    card.className = 'order-card rec-card';
    card.innerHTML = `
        <div class="rating"><i class="fa-solid fa-star"></i> ${product.rating || 'N/A'}</div>
        <div class="card-image"><img src="${product.image || ''}" alt="${product.name || 'Product'}" loading="lazy"></div>
        <h4>${product.name || ''}</h4>
        <h4 class="price">₹${parseFloat(product.price || 0).toFixed(2)}</h4>
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

/**
 * Initializes the recommendations section by fetching products and evaluating order history.
 */
export async function initRecommendations() {
    if (typeof document === 'undefined') return;
    const section = document.getElementById('recommendations');
    if (!section) return;

    const orders = (() => { 
        try { 
            return typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') : []; 
        } catch (_) { 
            return []; 
        } 
    })();

    let products;
    try {
        const res = await fetch(PRODUCTS_PATH);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        products = await res.json();
    } catch (_) { 
        return; 
    }

    const grid = section.querySelector('.rec-grid');
    const heading = section.querySelector('.rec-heading');
    if (!grid) return;

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

    if (!picks.length) { 
        section.style.display = 'none'; 
        return; 
    }

    grid.innerHTML = '';
    picks.forEach(p => {
        const card = buildCard(p);
        if (card) grid.appendChild(card);
    });
    section.style.display = '';
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initRecommendations);
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.getMostFrequentCuisine = getMostFrequentCuisine;
    window.getOrderedItemIds = getOrderedItemIds;
    window.loadCart = loadCart;
    window.saveCart = saveCart;
    window.addToCartLocal = addToCartLocal;
    window.buildCard = buildCard;
    window.initRecommendations = initRecommendations;
    window.recommendationsModule = {
        getMostFrequentCuisine,
        getOrderedItemIds,
        loadCart,
        saveCart,
        addToCartLocal,
        buildCard,
        initRecommendations
    };
}
