/**
 * Menu Module
 * Manages product catalog loading, filtering, searching, and favorite toggling.
 */

let allProducts = [];
let currentFilters = {
  search: '',
  price: 'all',
  cuisine: 'all',
  rating: 'all',
  type: 'all',
  favOnly: false
};

/**
 * Loads products from the JSON catalog and initial-renders cards.
 * @returns {Promise<Array>} Loaded products array
 */
export async function loadProducts() {
  try {
    const res = await fetch('../products.json');
    allProducts = await res.json();
    renderCards(allProducts);
    return allProducts;
  } catch (error) {
    console.error('Failed to load products:', error);
    return [];
  }
}

/**
 * Filters the product catalog based on search query, price, cuisine, rating, type, and favorites.
 * @returns {Array} Filtered products array
 */
export function getFilteredProducts() {
  return allProducts.filter(p => {
    const price = parseInt(p.price);
    if (currentFilters.search && !p.name.toLowerCase().includes(currentFilters.search.toLowerCase())) return false;
    if (currentFilters.type !== 'all' && p.type !== currentFilters.type) return false;
    if (currentFilters.cuisine !== 'all' && p.cuisine !== currentFilters.cuisine) return false;
    if (currentFilters.price === 'low' && price >= 100) return false;
    if (currentFilters.price === 'mid' && (price < 100 || price > 200)) return false;
    if (currentFilters.price === 'high' && price <= 200) return false;
    if (currentFilters.rating === 'above4' && p.rating < 4) return false;
    if (currentFilters.rating === 'above3' && p.rating < 3) return false;
    if (currentFilters.rating === 'below3' && p.rating >= 3) return false;
    if (currentFilters.favOnly) {
      const favs = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('favorites') || '[]') : [];
      if (!favs.includes(p.id)) return false;
    }
    return true;
  });
}

/**
 * Renders product cards into the DOM container.
 * @param {Array} products - Products to render
 */
export function renderCards(products) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('itemsNotAvailable');
  if (!container) return;
  
  container.innerHTML = '';
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">No items found.</p>';
    return;
  }
  
  products.forEach(p => {
    const favs = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('favorites') || '[]') : [];
    const isFav = favs.includes(p.id);
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <div class="fav-icon" data-id="${p.id}" style="cursor:pointer;font-size:20px;text-align:right;padding:6px;">
        ${isFav ? '❤️' : '🤍'}
      </div>
      <img src="${p.image}" alt="${p.name}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;" />
      <h3 style="margin:10px 0 4px;">${p.name}</h3>
      <p style="color:#888;font-size:13px;">${p.cuisine} • ${p.type}</p>
      <p style="font-size:13px;">⭐ ${p.rating}</p>
      <p style="font-weight:bold;">₹${p.price}</p>
      <button class="add-cart-btn" data-id="${p.id}" style="margin-top:8px;width:100%;padding:8px;background:#ff6b6b;color:#fff;border:none;border-radius:6px;cursor:pointer;">Add to Cart</button>
    `;
    card.querySelector('.fav-icon').addEventListener('click', () => toggleFav(p.id, card));
    card.querySelector('.add-cart-btn').addEventListener('click', () => addToCart(p.id));
    container.appendChild(card);
  });
}

/**
 * Toggles a product's favorite status in localStorage.
 * @param {string|number} id - Product ID
 * @param {HTMLElement} card - Card element reference
 * @returns {Array} Updated favorite IDs
 */
export function toggleFav(id, card) {
  if (typeof localStorage === 'undefined') return [];
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    if (card) card.querySelector('.fav-icon').textContent = '🤍';
  } else {
    favs.push(id);
    if (card) card.querySelector('.fav-icon').textContent = '❤️';
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
  if (currentFilters.favOnly) renderCards(getFilteredProducts());
  return favs;
}

/**
 * Displays a toast notification message.
 * @param {string} message - Message to display
 */
export function showAddToCartToast(message) {
  if (typeof document === 'undefined') return;
  if (typeof showToast === 'function') { showToast(message); return; }
  const container = document.querySelector('.toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/**
 * Adds a product to the user's cart in localStorage.
 * @param {string|number} id - Product ID
 */
export function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product || typeof localStorage === 'undefined') return;
  
  let cart = JSON.parse(localStorage.getItem('foodie:cart') || '[]');
  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  
  localStorage.setItem('foodie:cart', JSON.stringify(cart));
  
  if (typeof document !== 'undefined') {
    const cartValue = document.querySelector('.cart-value');
    if (cartValue) cartValue.textContent = cart.reduce((a, i) => a + i.quantity, 0);
  }
  
  showAddToCartToast(`${product.name} added to cart!`);
}

/**
 * Binds custom dropdown options to filters.
 * @param {string} selectorId - Container ID
 * @param {string} filterKey - Filter key
 */
export function bindDropdown(selectorId, filterKey) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById(selectorId);
  if (!container) return;
  
  container.querySelectorAll('.options li').forEach(li => {
    li.addEventListener('mousedown', (e) => {
      currentFilters[filterKey] = li.dataset.value;
      renderCards(getFilteredProducts());
    }, true);
  });
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        currentFilters.search = e.target.value;
        renderCards(getFilteredProducts());
      });
    }

    const filterVeg = document.getElementById('filterVeg');
    if (filterVeg) filterVeg.addEventListener('click', () => {
      currentFilters.type = 'veg';
      renderCards(getFilteredProducts());
    });

    const filterNonVeg = document.getElementById('filterNonVeg');
    if (filterNonVeg) filterNonVeg.addEventListener('click', () => {
      currentFilters.type = 'non-veg';
      renderCards(getFilteredProducts());
    });

    const filterAll = document.getElementById('filterAll');
    if (filterAll) filterAll.addEventListener('click', () => {
      currentFilters.type = 'all';
      renderCards(getFilteredProducts());
    });

    const favToggle = document.getElementById('favToggle');
    if (favToggle) favToggle.addEventListener('click', () => {
      currentFilters.favOnly = !currentFilters.favOnly;
      renderCards(getFilteredProducts());
    });

    bindDropdown('priceSelector', 'price');
    bindDropdown('cuisineSelector', 'cuisine');
    bindDropdown('ratingSelector', 'rating');
  });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
  window.addToCart = addToCart;
  window.loadProducts = loadProducts;
  window.getFilteredProducts = getFilteredProducts;
  window.renderCards = renderCards;
  window.toggleFav = toggleFav;
  window.menuModule = {
    loadProducts,
    getFilteredProducts,
    renderCards,
    toggleFav,
    addToCart,
    bindDropdown
  };
}
