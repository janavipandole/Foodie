// ===== SWIPER =====
var swiper = new Swiper(".mySwiper", {
    loop: true,
    navigation: {
        nextEl: ".fa-arrow-right",
        prevEl: ".fa-arrow-left",
    },
});

// ===== ELEMENT SELECTORS =====
const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const cardList = document.querySelector('.card-list');
const cartList = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.cart-total');
const cartValue = document.querySelector('.cart-value');
const hamburger = document.querySelector('.hamberger');
const mobileMenu = document.querySelector('.mobile-menu');
const bars = document.querySelector('.fa-bars');
const backToTop = document.querySelector('.back-to-top');
const themeToggles = document.querySelectorAll('.theme-toggle');

// QR Code Modal elements
const qrCodeWrapper = document.getElementById('qrCodeWrapper');
const qrCodeModal = document.getElementById('qrCodeModal');
const qrModalCloseBtn = document.querySelector('.qr-modal-close');
const qrModalImgLarge = document.getElementById('qrModalImgLarge');
const qrCodeImg = document.querySelector('.qr-code-img');


// ===== CART OPEN/CLOSE =====
cartIcon?.addEventListener('click', () => {
    cartTab.classList.add("cart-tab-active");
    // Show skeleton cart items if cart is empty
    if (addProduct.length === 0) {
        showSkeletonCartItems();
    }
});
closeBtn?.addEventListener('click', () => cartTab.classList.remove("cart-tab-active"));
hamburger?.addEventListener('click', () => {
    mobileMenu.classList.toggle("mobile-menu-active");
    bars.classList.toggle("fa-xmark");
    bars.classList.toggle("fa-bars");
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTop?.classList.add('visible');
    else backToTop?.classList.remove('visible');
});

backToTop?.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== THEME TOGGLE =====
const applySmoothTransition = () => {
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 600);
};

const updateThemeIcons = theme => {
    themeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        const label = toggle.querySelector('span');
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
            toggle.classList.add('dark');
            if (label) label.textContent = 'Light Mode ☀';
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            toggle.classList.remove('dark');
            if (label) label.textContent = 'Dark Mode 🌙';
        }
        icon.classList.add('rotate-icon');
        setTimeout(() => icon.classList.remove('rotate-icon'), 600);
    });
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applySmoothTransition();
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
};

themeToggles.forEach(toggle => toggle.addEventListener('click', toggleTheme));

const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
};
initTheme();

// ===== QR CODE MODAL LOGIC =====
if (qrCodeWrapper && qrCodeModal && qrModalCloseBtn && qrModalImgLarge && qrCodeImg) {
    qrCodeWrapper.addEventListener('click', () => {
        qrModalImgLarge.src = qrCodeImg.src; // Set the large image source
        qrCodeModal.style.display = 'flex'; // Show the modal
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    });

    qrModalCloseBtn.addEventListener('click', () => {
        qrCodeModal.style.display = 'none'; // Hide the modal
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close modal if clicked outside content
    qrCodeModal.addEventListener('click', (e) => {
        if (e.target === qrCodeModal) {
            qrCodeModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && qrCodeModal.style.display === 'flex') {
            qrCodeModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}


// ===== PRODUCTS & CART =====
let productList = [];
let addProduct = [];

// ===== FAVORITES (WISHLIST) =====
const FAVORITES_STORAGE_KEY = 'foodie:favorites';
let favoriteIds = new Set();

const loadFavorites = () => {
    try {
        const raw = localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]';
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) favoriteIds = new Set(arr);
    } catch (_) { favoriteIds = new Set(); }
};

const saveFavorites = () => {
    try { localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds])); } catch (_) {}
};

const isFavorite = id => favoriteIds.has(id);
const toggleFavorite = id => {
    if (favoriteIds.has(id)) favoriteIds.delete(id); else favoriteIds.add(id);
    saveFavorites();
};
loadFavorites();

// Show toast notification
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        ${message}
    `;
    
    const container = document.querySelector('.toast-container');
    container.appendChild(toast);
    
    // Trigger reflow for animation
    toast.offsetHeight;
    toast.classList.add('show');
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const updateTotalPrice = () => {
    let totalPrice = 0;
    let totalQuantity = 0;

    if (cartList && cartList.children.length > 0) {
        cartList.querySelectorAll('.item').forEach(item => {
            const quantity = parseInt(item.querySelector('.quantity-value').textContent);
            const price = parseFloat(item.querySelector('.item-total').textContent.replace(/[₹$]/g, ''));
            totalPrice += price;
            totalQuantity += quantity;
        });
        if (cartTotal) cartTotal.textContent = `₹${totalPrice.toFixed(2)}`;
        if (cartValue) cartValue.textContent = totalQuantity;
        return;
    }

    addProduct.forEach(p => {
        const price = parseFloat(p.price.replace(/[₹$]/g, ''));
        totalPrice += price * (p.quantity || 0);
        totalQuantity += (p.quantity || 0);
    });
    if (cartTotal) cartTotal.textContent = `₹${totalPrice.toFixed(2)}`;
    if (cartValue) cartValue.textContent = totalQuantity;
};

// ===== VEG/NON-VEG FILTER =====
let currentTypeFilter = 'all';
const filterVeg = document.getElementById('filterVeg');
const filterNonVeg = document.getElementById('filterNonVeg');
const filterAll = document.getElementById('filterAll');

[filterVeg, filterNonVeg, filterAll].forEach(btn => {
  if (btn) btn.classList.remove('active'); // Set all inactive by default
});
if (filterAll) filterAll.classList.add('active');

filterVeg?.addEventListener('click', () => {
  currentTypeFilter = 'veg';
  setTypeActive('veg');
  applyFilters();
});
filterNonVeg?.addEventListener('click', () => {
  currentTypeFilter = 'non-veg';
  setTypeActive('non-veg');
  applyFilters();
});
filterAll?.addEventListener('click', () => {
  currentTypeFilter = 'all';
  setTypeActive('all');
  applyFilters();
});

function setTypeActive(type) {
  filterVeg.classList.toggle('active', type === 'veg');
  filterNonVeg.classList.toggle('active', type === 'non-veg');
  filterAll.classList.toggle('active', type === 'all');
}



// ===== UPDATE CARD BUTTON STATE =====
const updateCardButton = (card, product) => {
    const existProduct = addProduct.find(item => item.id === product.id);
    const buttonContainer = card.querySelector('.card-btn-container');
    
    if (existProduct && existProduct.quantity > 0) {
        // Show quantity selector
        buttonContainer.innerHTML = `
            <div class="quantity-selector flex">
                <button class="qty-btn minus-btn" data-id="${product.id}">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <span class="qty-display">${existProduct.quantity}</span>
                <button class="qty-btn plus-btn" data-id="${product.id}">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to quantity buttons
        const minusBtn = buttonContainer.querySelector('.minus-btn');
        const plusBtn = buttonContainer.querySelector('.plus-btn');
        
        minusBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            decreaseQuantity(product, card);
        });
        
        plusBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            increaseQuantity(product, card);
        });
    } else {
        // Show "Add to Cart" button
        buttonContainer.innerHTML = `
            <a href="#" class="btn card-btn">Add to Cart</a>
        `;
        
        buttonContainer.querySelector('.card-btn').addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product, card);
        });
    }
};

// ===== INCREASE QUANTITY =====
const increaseQuantity = (product, card) => {
    const price = parseFloat(product.price.replace(/[₹$]/g, ''));
    let existProduct = addProduct.find(item => item.id === product.id);
    
    if (existProduct) {
        existProduct.quantity++;
        
        // Update cart item
        const cartItem = [...cartList.querySelectorAll('.item')]
            .find(item => item.querySelector('.detail h4').textContent === product.name);
        if (cartItem) {
            const quantityValue = cartItem.querySelector('.quantity-value');
            const itemTotal = cartItem.querySelector('.item-total');
            quantityValue.textContent = existProduct.quantity;
            itemTotal.textContent = `₹${(existProduct.quantity * price).toFixed(2)}`;
        }
        
        // Update card button
        updateCardButton(card, product);
        updateTotalPrice();
        saveCart();
    }
};

// ===== DECREASE QUANTITY =====
const decreaseQuantity = (product, card) => {
    const price = parseFloat(product.price.replace(/[₹$]/g, ''));
    let existProduct = addProduct.find(item => item.id === product.id);
    
    if (existProduct) {
        existProduct.quantity--;
        
        if (existProduct.quantity === 0) {
            // Remove from cart
            addProduct = addProduct.filter(item => item.id !== product.id);
            
            const cartItem = [...cartList.querySelectorAll('.item')]
                .find(item => item.querySelector('.detail h4').textContent === product.name);
            if (cartItem) cartItem.remove();
        } else {
            // Update cart item
            const cartItem = [...cartList.querySelectorAll('.item')]
                .find(item => item.querySelector('.detail h4').textContent === product.name);
            if (cartItem) {
                const quantityValue = cartItem.querySelector('.quantity-value');
                const itemTotal = cartItem.querySelector('.item-total');
                quantityValue.textContent = existProduct.quantity;
                itemTotal.textContent = `₹${(existProduct.quantity * price).toFixed(2)}`;
            }
        }
        
        // Update card button
        updateCardButton(card, product);
        updateTotalPrice();
        saveCart();
    }
};

// ===== ADD TO CART =====
const addToCart = (product, card) => {
    const price = parseFloat(product.price.replace(/[₹$]/g, ''));
    let existProduct = addProduct.find(item => item.id === product.id);

    if (existProduct) {
        increaseQuantity(product, card);
        showToast(`Added another ${product.name} to cart`);
        return;
    }

    product.quantity = 1;
    addProduct.push(product);
    showToast(`${product.name} added to cart`);

    const cartItem = document.createElement('div');
    cartItem.classList.add('item');
    cartItem.innerHTML = `
        <div class="images-container"><img src="${product.image}"></div>
        <div class="detail">
            <h4>${product.name}</h4>
            <h4 class="item-total">₹${price.toFixed(2)}</h4>
        </div>
        <div class="flex">
            <a href="#" class="quantity-btn minus"><i class="fa-solid fa-minus"></i></a>
            <h4 class="quantity-value">1</h4>
            <a href="#" class="quantity-btn plus"><i class="fa-solid fa-plus"></i></a>
        </div>
    `;
    cartList.appendChild(cartItem);
    updateTotalPrice();
    saveCart();

    const plusBtn = cartItem.querySelector('.plus');
    const minusBtn = cartItem.querySelector('.minus');
    const quantityValue = cartItem.querySelector('.quantity-value');
    const itemTotal = cartItem.querySelector('.item-total');

    plusBtn.addEventListener('click', e => {
        e.preventDefault();
        product.quantity++;
        quantityValue.textContent = product.quantity;
        itemTotal.textContent = `₹${(product.quantity * price).toFixed(2)}`;
        updateTotalPrice();
        updateCardButton(card, product);
        saveCart();
    });

    minusBtn.addEventListener('click', e => {
        e.preventDefault();
        if (product.quantity > 1) {
            product.quantity--;
            quantityValue.textContent = product.quantity;
            itemTotal.textContent = `₹${(product.quantity * price).toFixed(2)}`;
            updateTotalPrice();
            updateCardButton(card, product);
            saveCart();
        } else {
            cartItem.remove();
            addProduct = addProduct.filter(item => item.id !== product.id);
            updateTotalPrice();
            updateCardButton(card, product);
            saveCart();
        }
    });
    
    // Update the card button to show quantity selector
    updateCardButton(card, product);
};

// ===== CHECKOUT =====
const checkoutBtn = document.querySelector('.check-out');
checkoutBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (addProduct.length === 0) return alert('Your cart is empty!');

    const checkoutData = addProduct.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity
    }));

    sessionStorage.setItem('checkoutCart', JSON.stringify(checkoutData));
    window.location.href = '/html/checkout.html';
});

// ===== RENDER PRODUCT CARDS =====
const showCards = list => {
    if (!cardList) return;
    cardList.innerHTML = '';
    if (!list || list.length === 0) {
        const msg = document.createElement('div');
        msg.classList.add('no-items-message');
        msg.textContent = 'Oops! No items available.';
        cardList.appendChild(msg);
        return;
    }

    list.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('order-card');
        const favActive = isFavorite(product.id);
       card.innerHTML = `
    <button class="fav-btn${favActive ? ' active' : ''}" aria-label="Toggle favorite" aria-pressed="${favActive}" title="${favActive ? 'Remove from favorites' : 'Add to favorites'}">
        <i class="${favActive ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
    </button>
    <div class="card-image"><img src="${product.image}" alt="${product.name}"></div>
    
    <div class="rating">
      <i class="fa-solid fa-star"></i> ${product.rating ? product.rating : 'N/A'}
    </div>

    <h4>${product.name}</h4>
    <h4 class="price">₹${parseFloat(product.price.replace(/[₹$]/g, '')).toFixed(2)}</h4>
    <div class="card-btn-container"></div>
`;

        
        // Initialize button state
        updateCardButton(card, product);
        
        card.addEventListener('click', e => {
            if (!e.target.closest('.card-btn-container') && !e.target.closest('.fav-btn')) {
                openFoodModal(product);
            }
        });

        const favBtn = card.querySelector('.fav-btn');
        favBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
            const nowActive = isFavorite(product.id);
            favBtn.classList.toggle('active', nowActive);
            favBtn.setAttribute('aria-pressed', String(nowActive));
            favBtn.setAttribute('title', nowActive ? 'Remove from favorites' : 'Add to favorites');
            const icon = favBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-solid', nowActive);
                icon.classList.toggle('fa-regular', !nowActive);
            }
        });
        cardList.appendChild(card);
    });
};

// ===== SEARCH + PRICE FILTER =====
const priceSelector = document.getElementById('priceSelector');
const selected = priceSelector?.querySelector('.selected');
const options = priceSelector?.querySelectorAll('.options li');
let currentPriceFilter = 'all';
let currentCuisineFilter = 'all';
let currentRatingFilter = 'all';
let favoritesOnly = false;

selected?.addEventListener('click', () => priceSelector.classList.toggle('open'));
options?.forEach(opt => {
    opt.addEventListener('click', e => {
        currentPriceFilter = e.target.dataset.value;
        selected.textContent = e.target.textContent;
        priceSelector.classList.remove('open');
        applyFilters();
    });
});
document.addEventListener('click', e => {
    if (!priceSelector.contains(e.target)) priceSelector.classList.remove('open');
});

// ===== CUISINE FILTER =====
const cuisineSelector = document.getElementById('cuisineSelector');
const cuisineSelected = cuisineSelector?.querySelector('.selected');
const cuisineOptions = cuisineSelector?.querySelectorAll('.options li');

cuisineSelected?.addEventListener('click', () => cuisineSelector.classList.toggle('open'));
cuisineOptions?.forEach(opt => {
    opt.addEventListener('click', e => {
        currentCuisineFilter = e.target.dataset.value;
        cuisineSelected.textContent = e.target.textContent;
        cuisineSelector.classList.remove('open');
        applyFilters();
    });
});
document.addEventListener('click', e => {
    if (!cuisineSelector.contains(e.target)) cuisineSelector.classList.remove('open');
});

// ===== RATING FILTER =====
const ratingSelector = document.getElementById('ratingSelector');
const ratingSelected = ratingSelector?.querySelector('.selected');
const ratingOptions = ratingSelector?.querySelectorAll('.options li');

ratingSelected?.addEventListener('click', () => ratingSelector.classList.toggle('open'));
ratingOptions?.forEach(opt => {
    opt.addEventListener('click', e => {
        currentRatingFilter = e.target.dataset.value;
        ratingSelected.textContent = e.target.textContent;
        ratingSelector.classList.remove('open');
        applyFilters();
    });
});
document.addEventListener('click', e => {
    if (!ratingSelector.contains(e.target)) ratingSelector.classList.remove('open');
});

const searchInput = document.getElementById('search');
searchInput?.addEventListener('input', applyFilters);

const favToggle = document.getElementById('favToggle');
favToggle?.addEventListener('click', e => {
    e.preventDefault();
    favoritesOnly = !favoritesOnly;
    favToggle.classList.toggle('active', favoritesOnly);
    favToggle.setAttribute('aria-pressed', String(favoritesOnly));
    applyFilters();
});

function applyFilters() {
    if (!productList) return;
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const filtered = productList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const price = parseFloat((p.price || '0').toString().replace(/[₹$]/g, ''));
        let matchesPrice = true;

        if (currentPriceFilter === 'low') matchesPrice = price < 100;
        else if (currentPriceFilter === 'mid') matchesPrice = price >= 100 && price <= 200;
        else if (currentPriceFilter === 'high') matchesPrice = price > 200;

        const matchesFavorite = !favoritesOnly || isFavorite(p.id);

        let matchesType = true;
        if (currentTypeFilter === 'veg') matchesType = (p.type === 'veg');
        else if (currentTypeFilter === 'non-veg') matchesType = (p.type === 'non-veg');

        let matchesCuisine = true;
        if (currentCuisineFilter !== 'all') matchesCuisine = (p.cuisine === currentCuisineFilter);

        let matchesRating = true;
        if (currentRatingFilter === 'above4') matchesRating = (p.rating >= 4.0);
        else if (currentRatingFilter === 'above3') matchesRating = (p.rating >= 3.0);
        else if (currentRatingFilter === 'below3') matchesRating = (p.rating < 3.0);

        return matchesSearch && matchesPrice && matchesFavorite && matchesType && matchesCuisine && matchesRating;
    });
    showCards(filtered);
}

// ===== MODAL =====
const modal = document.getElementById('foodModal');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalAddBtn = document.getElementById('addToCartBtn');
const modalViewBtn = document.getElementById('viewCartBtn');
const modalClose = document.querySelector('#foodModal .modal-close'); // Corrected selector

function openFoodModal(product) {
    modalImage.src = product.image;
    modalName.textContent = product.name;
    modalPrice.textContent = `₹${parseFloat(product.price.replace(/[₹$]/g, '')).toFixed(2)}`;
    modalDescription.textContent = product.description || "No description available.";
    modal.style.display = 'flex';
    
    modalAddBtn.onclick = () => { 
        const card = [...cardList.querySelectorAll('.order-card')].find(c => 
            c.querySelector('h4').textContent === product.name
        );
        addToCart(product, card); 
        modal.style.display = 'none'; 
    };
    modalViewBtn.onclick = () => { cartTab.classList.add('cart-tab-active'); modal.style.display = 'none'; };
}

modalClose?.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
document.addEventListener('keydown', e => { if (e.key === "Escape") modal.style.display = 'none'; });

// ===== SKELETON LOADERS =====
const createSkeletonCard = () => {
    const skeleton = document.createElement('div');
    skeleton.classList.add('skeleton-card');
    skeleton.innerHTML = `
        <div class="skeleton skeleton-fav"></div>
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-price"></div>
        <div class="skeleton skeleton-btn"></div>
    `;
    return skeleton;
};

const createSkeletonCartItem = () => {
    const skeleton = document.createElement('div');
    skeleton.classList.add('skeleton-cart-item');
    skeleton.innerHTML = `
        <div class="skeleton skeleton-cart-image"></div>
        <div class="skeleton-cart-detail">
            <div class="skeleton skeleton-cart-text"></div>
            <div class="skeleton skeleton-cart-total"></div>
        </div>
        <div class="skeleton-cart-quantity">
            <div class="skeleton skeleton-cart-btn"></div>
            <div class="skeleton skeleton-cart-value"></div>
            <div class="skeleton skeleton-cart-btn"></div>
        </div>
    `;
    return skeleton;
};

const showSkeletonCards = (count = 6) => {
    if (!cardList) return;
    cardList.innerHTML = '';
    for (let i = 0; i < count; i++) {
        cardList.appendChild(createSkeletonCard());
    }
};

const showSkeletonCartItems = (count = 3) => {
    if (!cartList) return;
    cartList.innerHTML = '';
    for (let i = 0; i < count; i++) {
        cartList.appendChild(createSkeletonCartItem());
    }
};

// ===== INIT APP =====
const showLoadError = (message, retryCallback = null, status = '') => {
    if (!cardList) return;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-container';
    errorDiv.innerHTML = `
        <div class="error-icon">
            <i class="fa-solid fa-exclamation-circle"></i>
        </div>
        <h3 class="error-title">Oops! Something went wrong</h3>
        <p class="error-message">${message}</p>
        ${status ? `<div class="error-status">${status}</div>` : ''}
        ${retryCallback ? `
            <button class="retry-button">
                <i class="fa-solid fa-sync"></i> Try Again
            </button>
            <div class="retry-countdown"></div>
        ` : ''}
    `;
    
    if (retryCallback) {
        const retryBtn = errorDiv.querySelector('.retry-button');
        retryBtn.onclick = () => {
            retryBtn.disabled = true;
            retryBtn.innerHTML = `
                <div class="loading-spinner"></div> Retrying...
            `;
            retryCallback();
        };
    }
    
    cardList.innerHTML = '';
    cardList.appendChild(errorDiv);
};

const loadProducts = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    if (!navigator.onLine) {
        showLoadError(
            'No internet connection. Please check your connection and try again.',
            () => loadProducts(retryCount)
        );
        return;
    }

    try {
        // Show skeleton loading state
        showSkeletonCards();

        const pathname = window.location.pathname;
        let productsPath;
        const isUsingServer = pathname.startsWith('/') || window.location.protocol === 'http:' || window.location.protocol === 'https:';
        
        if (isUsingServer) {
            productsPath = '/products.json';
        } else if (pathname.includes('/html/')) {
            productsPath = '../products.json';
        } else {
            productsPath = '../products.json';
        }
        
        // Try the primary path first
        let res;
        try {
            res = await fetch(productsPath);
        } catch (err) {
            res = null;
        }
        
        // If that fails, try alternate paths
        if (!res || !res.ok) {
            const alternatePaths = isUsingServer 
                ? ['/products.json', '../products.json', './products.json']
                : ['../products.json', '/products.json', './products.json'];
            
            let found = false;
            let lastError = null;
            
            for (const altPath of alternatePaths) {
                if (altPath === productsPath && res) continue; // Skip the one we already tried
                try {
                    const altRes = await fetch(altPath);
                    if (altRes.ok) {
                        res = altRes;
                        productsPath = altPath;
                        found = true;
                        break;
                    }
                } catch (err) {
                    lastError = err;
                    continue;
                }
            }
            
            if (!found || !res || !res.ok) {
                const errorDetails = lastError ? lastError.message : (res ? `HTTP ${res.status}: ${res.statusText}` : 'Network error');
                throw new Error(`Failed to load products.json. ${errorDetails}. Current URL: ${window.location.href}. Make sure you're accessing via http://localhost:8000/html/menu.html (not file://)`);
            }
        }
        
        const data = await res.json();
        productList = data;
        showCards(productList);
        restoreCartFromStorage();
        
        // Check for search query in URL and auto-populate search input
        // Wait for DOM to be fully ready before accessing searchInput
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            if (searchQuery) {
                const searchInput = document.getElementById('search');
                if (searchInput) {
                    searchInput.value = decodeURIComponent(searchQuery);
                    applyFilters();
                }
            }
        }, 100);
    } catch (error) {
        console.error('Failed to load products:', error);
        
        let errorMessage = '';
        let statusMessage = '';
        let icon = 'exclamation-circle';

        if (!navigator.onLine) {
            errorMessage = 'You appear to be offline. Please check your internet connection and try again.';
            icon = 'wifi-slash';
            statusMessage = 'Network Status: Offline';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'The server is taking too long to respond. This might be a temporary issue.';
            icon = 'clock';
            statusMessage = 'Request Timeout';
        } else if (error.message.includes('404')) {
            errorMessage = 'We couldn\'t find the menu data. Our team has been notified.';
            icon = 'file-alt';
            statusMessage = 'Error 404: File Not Found';
        } else if (error.message.includes('parse')) {
            errorMessage = 'There was a problem reading the menu data. Our team has been notified.';
            icon = 'file-code';
            statusMessage = 'Invalid Data Format';
        } else {
            errorMessage = 'We\'re having trouble loading the menu right now.';
            statusMessage = 'Unexpected Error';
        }
        
        if (retryCount < MAX_RETRIES) {
            const retryDelay = RETRY_DELAY * Math.pow(2, retryCount);
            const nextRetry = retryCount + 1;
            
            showLoadError(
                errorMessage,
                () => loadProducts(nextRetry),
                `${statusMessage}<br>Attempt ${nextRetry} of ${MAX_RETRIES}`
            );
            
            // Update countdown timer
            const countdownDiv = document.querySelector('.retry-countdown');
            if (countdownDiv) {
                let timeLeft = retryDelay / 1000;
                const countdownInterval = setInterval(() => {
                    timeLeft--;
                    if (timeLeft > 0) {
                        countdownDiv.textContent = `Auto-retrying in ${timeLeft} seconds...`;
                    } else {
                        clearInterval(countdownInterval);
                    }
                }, 1000);
            }
            
            // Auto-retry with exponential backoff
            setTimeout(() => {
                loadProducts(nextRetry);
            }, retryDelay);
        } else {
            showLoadError(
                `${errorMessage}<br>We've tried several times but couldn't load the menu.`,
                () => loadProducts(0),
                'Maximum Retry Attempts Reached'
            );
        }
    }
};

loadProducts();

const CART_STORAGE_KEY = 'foodie:cart';
const loadCart = () => {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY) || '[]';
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
};
const saveCart = () => {
    try {
        // Persist full product objects (id, name, price, image, quantity)
        const arr = addProduct.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            quantity: p.quantity || 1
        }));
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(arr));
        // Keep sessionStorage.checkoutCart in sync so direct navigation to checkout
        // (which prefers sessionStorage) reflects the current cart state.
        if (arr.length > 0) {
            try { sessionStorage.setItem('checkoutCart', JSON.stringify(arr)); } catch (_) {}
        } else {
            try { sessionStorage.removeItem('checkoutCart'); } catch (_) {}
        }
    } catch (_) {}
};
const restoreCartFromStorage = () => {
    const saved = loadCart();
    if (!saved || saved.length === 0) { updateTotalPrice(); return; }

    // Support both legacy {id,quantity} and new full-product objects
    saved.forEach(s => {
        let product = null;

        if (s && s.name && s.price && s.image) {
            // New format: full product object persisted
            product = {
                id: s.id,
                name: s.name,
                price: s.price,
                image: s.image,
                quantity: s.quantity && s.quantity > 0 ? s.quantity : 1
            };
        } else {
            // Legacy format: find from productList
            const base = productList.find(p => p.id === s.id);
            if (!base) return; // can't restore this item
            product = { ...base, quantity: s.quantity && s.quantity > 0 ? s.quantity : 1 };
        }

        addProduct.push(product);
        if (cartList) {
            const price = parseFloat(product.price.replace(/[₹$]/g, ''));
            const cartItem = document.createElement('div');
            cartItem.classList.add('item');
            cartItem.innerHTML = `
        <div class="images-container"><img src="${product.image}"></div>
        <div class="detail">
            <h4>${product.name}</h4>
            <h4 class="item-total">₹${(price * product.quantity).toFixed(2)}</h4>
        </div>
        <div class="flex">
            <a href="#" class="quantity-btn minus"><i class="fa-solid fa-minus"></i></a>
            <h4 class="quantity-value">${product.quantity}</h4>
            <a href="#" class="quantity-btn plus"><i class="fa-solid fa-plus"></i></a>
        </div>
    `;
            cartList.appendChild(cartItem);
            const plusBtn = cartItem.querySelector('.plus');
            const minusBtn = cartItem.querySelector('.minus');
            const quantityValue = cartItem.querySelector('.quantity-value');
            const itemTotal = cartItem.querySelector('.item-total');
            plusBtn.addEventListener('click', e => {
                e.preventDefault();
                product.quantity++;
                quantityValue.textContent = product.quantity;
                itemTotal.textContent = `₹${(product.quantity * price).toFixed(2)}`;
                updateTotalPrice();
                const card = cardList ? [...cardList.querySelectorAll('.order-card')].find(c => c.querySelector('h4') && c.querySelector('h4').textContent === product.name) : null;
                if (card) updateCardButton(card, product);
                saveCart();
            });
            minusBtn.addEventListener('click', e => {
                e.preventDefault();
                if (product.quantity > 1) {
                    product.quantity--;
                    quantityValue.textContent = product.quantity;
                    itemTotal.textContent = `₹${(product.quantity * price).toFixed(2)}`;
                    updateTotalPrice();
                    const card = cardList ? [...cardList.querySelectorAll('.order-card')].find(c => c.querySelector('h4') && c.querySelector('h4').textContent === product.name) : null;
                    if (card) updateCardButton(card, product);
                    saveCart();
                } else {
                    cartItem.remove();
                    addProduct = addProduct.filter(item => item.id !== product.id);
                    updateTotalPrice();
                    const card = cardList ? [...cardList.querySelectorAll('.order-card')].find(c => c.querySelector('h4') && c.querySelector('h4').textContent === product.name) : null;
                    if (card) updateCardButton(card, product);
                    saveCart();
                }
            });
        }
    });
    updateTotalPrice();
    if (cardList) {
        [...cardList.querySelectorAll('.order-card')].forEach(card => {
            const nameEl = card.querySelector('h4');
            const prod = addProduct.find(p => nameEl && nameEl.textContent === p.name);
            if (prod) updateCardButton(card, prod);
        });
    }
};