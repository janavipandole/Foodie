(function() {
let allProducts = [];
let currentFilters = {
  search: '',
  price: 'all',
  cuisine: 'all',
  rating: 'all',
  type: 'all',
  favOnly: false
};

async function loadProducts() {
  const res = await fetch('../products.json');
  allProducts = await res.json();
  renderCards(allProducts);
}

function getFilteredProducts() {
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
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (!favs.includes(p.id)) return false;
    }
    return true;
  });
}

function renderCards(products) {
  const container = document.getElementById('itemsNotAvailable');
  container.innerHTML = '';
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">No items found.</p>';
    return;
  }
  products.forEach(p => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
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
      <button onclick="addToCart(${p.id})" style="margin-top:8px;width:100%;padding:8px;background:#ff6b6b;color:#fff;border:none;border-radius:6px;cursor:pointer;">Add to Cart</button>
    `;
    card.querySelector('.fav-icon').addEventListener('click', () => toggleFav(p.id, card));
    container.appendChild(card);
  });
}

function toggleFav(id, card) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    card.querySelector('.fav-icon').textContent = '🤍';
  } else {
    favs.push(id);
    card.querySelector('.fav-icon').textContent = '❤️';
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
  if (currentFilters.favOnly) renderCards(getFilteredProducts());
}

window.addToCart = function(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  const cartValue = document.querySelector('.cart-value');
  if (cartValue) cartValue.textContent = cart.reduce((a, i) => a + i.qty, 0);
  alert(`${product.name} added to cart!`);
};

function bindDropdown(selectorId, filterKey) {
  const container = document.getElementById(selectorId);
  if (!container) return;
  container.querySelectorAll('.options li').forEach(li => {
    li.addEventListener('mousedown', (e) => {
      currentFilters[filterKey] = li.dataset.value;
      renderCards(getFilteredProducts());
    }, true);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();

  document.getElementById('search').addEventListener('input', e => {
    currentFilters.search = e.target.value;
    renderCards(getFilteredProducts());
  });

  document.getElementById('filterVeg').addEventListener('click', () => {
    currentFilters.type = 'veg';
    renderCards(getFilteredProducts());
  });
  document.getElementById('filterNonVeg').addEventListener('click', () => {
    currentFilters.type = 'non-veg';
    renderCards(getFilteredProducts());
  });
  document.getElementById('filterAll').addEventListener('click', () => {
    currentFilters.type = 'all';
    renderCards(getFilteredProducts());
  });

  document.getElementById('favToggle').addEventListener('click', () => {
    currentFilters.favOnly = !currentFilters.favOnly;
    renderCards(getFilteredProducts());
  });

  bindDropdown('priceSelector', 'price');
  bindDropdown('cuisineSelector', 'cuisine');
  bindDropdown('ratingSelector', 'rating');
});
})();
