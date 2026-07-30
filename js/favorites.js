/**
 * Favorites Module
 * Manages favorite items persistence, filtering, and DOM rendering.
 */

let allProducts = [];
let currentTypeFilter = 'all';

/**
 * Retrieves the list of favorite item IDs from localStorage.
 * @returns {Array<string|number>} Array of favorite IDs
 */
export function getFavoriteIds() {
  try {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse favorites from localStorage:', error);
    return [];
  }
}

/**
 * Retrieves full favorite product objects based on stored IDs.
 * @param {Array} productsCatalog - Full catalog of products
 * @returns {Array} Array of favorite product objects
 */
export function getFavoriteProducts(productsCatalog = allProducts) {
  const favs = getFavoriteIds();
  return productsCatalog.filter(p => favs.includes(p.id));
}

/**
 * Filters favorite products based on the current type filter ('all', 'veg', 'non-veg').
 * @param {Array} products - Array of favorite products
 * @param {string} filterType - Filter category
 * @returns {Array} Filtered products array
 */
export function getFilteredFavorites(products = getFavoriteProducts(), filterType = currentTypeFilter) {
  currentTypeFilter = filterType;
  return products.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    return true;
  });
}

/**
 * Loads favorites data from products.json and renders the cards.
 */
export async function loadFavorites() {
  const container = document.getElementById('itemsNotAvailable');
  if (!container) return;
  try {
    const res = await fetch('../products.json');
    allProducts = await res.json();
    renderCards(getFilteredFavorites());
  } catch (err) {
    container.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">Unable to load favorites right now. Please try again.</p>';
  }
}

/**
 * Renders favorite product cards onto the DOM.
 * @param {Array} products - Products to render
 */
export function renderCards(products) {
  const container = document.getElementById('itemsNotAvailable');
  if (!container) return;
  container.innerHTML = '';
  
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">No favorites yet. Tap the heart icon on any item in the menu to save it here.</p>';
    return;
  }
  
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <div class="fav-icon" data-id="${p.id}" style="cursor:pointer;font-size:20px;text-align:right;padding:6px;">
        ❤️
      </div>
      <img src="${p.image}" alt="${p.name}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;" />
      <h3 style="margin:10px 0 4px;">${p.name}</h3>
      <p style="color:#888;font-size:13px;">${p.cuisine} • ${p.type}</p>
      <p style="font-size:13px;">⭐ ${p.rating}</p>
      <p style="font-weight:bold;">₹${p.price}</p>
      <button class="add-to-cart-btn" data-id="${p.id}" style="margin-top:8px;width:100%;padding:8px;background:#ff6b6b;color:#fff;border:none;border-radius:6px;cursor:pointer;">Add to Cart</button>
    `;
    
    card.querySelector('.fav-icon').addEventListener('click', () => removeFavorite(p.id));
    card.querySelector('.add-to-cart-btn').addEventListener('click', () => addFavoriteToCart(p.id));
    
    container.appendChild(card);
  });
}

/**
 * Removes a product from favorites in localStorage and re-renders cards.
 * @param {string|number} id - Product ID
 * @returns {Array} Updated favorite IDs
 */
export function removeFavorite(id) {
  let favs = getFavoriteIds();
  favs = favs.filter(f => f !== id);
  localStorage.setItem('favorites', JSON.stringify(favs));
  renderCards(getFilteredFavorites());
  return favs;
}

/**
 * Shows a toast message notification.
 * @param {string} message - Toast text
 */
export function showFavoriteToast(message) {
  if (typeof showToast === 'function') { 
    showToast(message); 
    return; 
  }
  const container = document.querySelector('.toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/**
 * Adds a favorite item directly to the cart.
 * @param {string|number} id - Product ID
 */
export function addFavoriteToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  let cart = JSON.parse(localStorage.getItem('foodie:cart') || '[]');
  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  localStorage.setItem('foodie:cart', JSON.stringify(cart));
  
  const cartValue = document.querySelector('.cart-value');
  if (cartValue) cartValue.textContent = cart.reduce((a, i) => a + i.quantity, 0);
  showFavoriteToast(`${product.name} added to cart!`);
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();

    const vegBtn = document.getElementById('filterVeg');
    const nonVegBtn = document.getElementById('filterNonVeg');
    const allBtn = document.getElementById('filterAll');

    vegBtn && vegBtn.addEventListener('click', () => {
      currentTypeFilter = 'veg';
      renderCards(getFilteredFavorites());
    });
    
    nonVegBtn && nonVegBtn.addEventListener('click', () => {
      currentTypeFilter = 'non-veg';
      renderCards(getFilteredFavorites());
    });
    
    allBtn && allBtn.addEventListener('click', () => {
      currentTypeFilter = 'all';
      renderCards(getFilteredFavorites());
    });
  });
}

// Global window bindings for backward compatibility
if (typeof window !== 'undefined') {
  window.addFavoriteToCart = addFavoriteToCart;
  window.favoritesModule = {
    getFavoriteIds,
    getFavoriteProducts,
    getFilteredFavorites,
    loadFavorites,
    renderCards,
    removeFavorite,
    addFavoriteToCart
  };
}
