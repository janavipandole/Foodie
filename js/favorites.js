(function() {
let allProducts = [];
let currentTypeFilter = 'all';

function getFavoriteIds() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function getFavoriteProducts() {
  const favs = getFavoriteIds();
  return allProducts.filter(p => favs.includes(p.id));
}

function getFilteredFavorites() {
  return getFavoriteProducts().filter(p => {
    if (currentTypeFilter !== 'all' && p.type !== currentTypeFilter) return false;
    return true;
  });
}

async function loadFavorites() {
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

function renderCards(products) {
  const container = document.getElementById('itemsNotAvailable');
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
      <button onclick="addFavoriteToCart(${p.id})" style="margin-top:8px;width:100%;padding:8px;background:#ff6b6b;color:#fff;border:none;border-radius:6px;cursor:pointer;">Add to Cart</button>
    `;
    card.querySelector('.fav-icon').addEventListener('click', () => removeFavorite(p.id));
    container.appendChild(card);
  });
}

function removeFavorite(id) {
  let favs = getFavoriteIds();
  favs = favs.filter(f => f !== id);
  localStorage.setItem('favorites', JSON.stringify(favs));
  renderCards(getFilteredFavorites());
}

function showFavoriteToast(message) {
  if (typeof showToast === 'function') { showToast(message); return; }
  const container = document.querySelector('.toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

window.addFavoriteToCart = function(id) {
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
};

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
})();