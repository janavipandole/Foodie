// ===== SAFE QUERY SELECTOR =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ===== SWIPER =====
if (typeof Swiper !== 'undefined') {
    new Swiper(".mySwiper", {
        loop: true,
        navigation: {
            nextEl: ".fa-arrow-right",
            prevEl: ".fa-arrow-left",
        },
    });
}

// ===== ELEMENTS =====
const cartIcon = $('.cart-icon');
const cartTab = $('.cart-tab');
const closeBtn = $('.close-btn');
const cardList = $('.card-list');
const cartList = $('.cart-list');
const cartTotal = $('.cart-total');
const cartValue = $('.cart-value');
const hamburger = $('.hamberger');
const mobileMenu = $('.mobile-menu');
const bars = $('.fa-bars');
const backToTop = $('.back-to-top');
const themeToggles = $$('.theme-toggle');

// ===== SAFE EVENT LISTENER =====
const safeOn = (el, event, cb) => el && el.addEventListener(event, cb);

// ===== CART TOGGLE =====
safeOn(cartIcon, 'click', () => cartTab?.classList.add("cart-tab-active"));
safeOn(closeBtn, 'click', () => cartTab?.classList.remove("cart-tab-active"));

// ===== MOBILE MENU =====
safeOn(hamburger, 'click', () => {
    mobileMenu?.classList.toggle("mobile-menu-active");
    bars?.classList.toggle("fa-xmark");
    bars?.classList.toggle("fa-bars");
});

// ===== SCROLL =====
window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 400);
});

safeOn(backToTop, 'click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== THEME =====
const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);

    themeToggles.forEach(t => {
        const icon = t.querySelector('i');
        if (!icon) return;
        icon.classList.toggle('fa-sun');
        icon.classList.toggle('fa-moon');
    });
};

themeToggles.forEach(t => safeOn(t, 'click', toggleTheme));

// INIT THEME
(() => {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
})();

// ===== DATA =====
let productList = [];
let cart = [];

// ===== CART STORAGE =====
const CART_KEY = 'foodie:cart';

const saveCart = () => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const loadCart = () => {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
};

// ===== UPDATE TOTAL =====
const updateTotal = () => {
    let total = 0, qty = 0;

    cart.forEach(p => {
        const price = parseFloat(p.price.replace(/[₹$]/g, ''));
        total += price * p.quantity;
        qty += p.quantity;
    });

    if (cartTotal) cartTotal.textContent = `₹${total.toFixed(2)}`;
    if (cartValue) cartValue.textContent = qty;
};

// ===== ADD TO CART =====
const addToCart = (product) => {
    const exist = cart.find(p => p.id === product.id);

    if (exist) {
        exist.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    renderCart();
    saveCart();
};

// ===== RENDER CART =====
const renderCart = () => {
    if (!cartList) return;

    cartList.innerHTML = '';

    cart.forEach(p => {
        const price = parseFloat(p.price.replace(/[₹$]/g, ''));

        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <img src="${p.image}">
            <div>
                <h4>${p.name}</h4>
                <p>₹${(price * p.quantity).toFixed(2)}</p>
            </div>
            <div>
                <button class="minus">-</button>
                <span>${p.quantity}</span>
                <button class="plus">+</button>
            </div>
        `;

        item.querySelector('.plus').onclick = () => {
            p.quantity++;
            renderCart();
            saveCart();
        };

        item.querySelector('.minus').onclick = () => {
            p.quantity--;
            if (p.quantity <= 0) {
                cart = cart.filter(x => x.id !== p.id);
            }
            renderCart();
            saveCart();
        };

        cartList.appendChild(item);
    });

    updateTotal();
};

// ===== PRODUCTS =====
const renderProducts = (list) => {
    if (!cardList) return;

    cardList.innerHTML = '';

    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'order-card';

        card.innerHTML = `
            <img src="${p.image}">
            <h4>${p.name}</h4>
            <p>₹${p.price}</p>
            <button class="add">Add</button>
        `;

        card.querySelector('.add').onclick = () => addToCart(p);

        cardList.appendChild(card);
    });
};

// ===== LOAD PRODUCTS =====
const loadProducts = async () => {
    try {
        const res = await fetch('/products.json');
        if (!res.ok) throw new Error("Failed to load");

        productList = await res.json();
        renderProducts(productList);

        cart = loadCart();
        renderCart();

    } catch (err) {
        console.error(err);
        if (cardList) {
            cardList.innerHTML = `<p style="color:red;">Failed to load products</p>`;
        }
    }
};

loadProducts();
