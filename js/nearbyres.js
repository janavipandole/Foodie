// ===== DARK MODE FUNCTIONALITY =====
const themeToggleBtns = document.querySelectorAll('.theme-toggle');
const body = document.body;
const navbar = document.querySelector('header');

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

// Update icon on page load
updateThemeIcon(currentTheme);

// Theme toggle event
themeToggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
});

function updateThemeIcon(theme) {
  themeToggleBtns.forEach(btn => {
    const icon = btn.querySelector('i');
    if (theme === 'dark') {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  });
}

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== HAMBURGER MENU TOGGLE =====
const hamburger = document.querySelector('.hamberger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger.addEventListener('click', (e) => {
  e.preventDefault();
  mobileMenu.classList.toggle('mobile-menu-active');
});

// ===== CUSTOM LANGUAGE SELECT =====
const customSelect = document.getElementById('language-custom-select');
const selected = customSelect.querySelector('.selected');
const optionsList = customSelect.querySelector('.options');
const options = customSelect.querySelectorAll('.options li');

selected.addEventListener('click', () => {
  customSelect.classList.toggle('open');
  const isOpen = customSelect.classList.contains('open');
  selected.setAttribute('aria-expanded', isOpen);
});

options.forEach(option => {
  option.addEventListener('click', () => {
    selected.textContent = option.textContent;
    customSelect.classList.remove('open');
    selected.setAttribute('aria-expanded', 'false');
    
    // Update all options' aria-selected
    options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
    option.setAttribute('aria-selected', 'true');
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!customSelect.contains(e.target)) {
    customSelect.classList.remove('open');
    selected.setAttribute('aria-expanded', 'false');
  }
});

// ===== BACK TO TOP BUTTON =====
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

// ===== RESTAURANT DATA & RENDERING =====
const restaurants = [
  { name: "Spice Affair", type: "Authentic Indian Cuisine", rating: 4.7, distance: "1.2 km", image: "../imgs/rest1.png" },
  { name: "Urban Eatery", type: "Modern Café & Grill", rating: 4.6, distance: "0.8 km", image: "../imgs/rest2.png" },
  { name: "Sushi Haven", type: "Fresh Japanese Rolls", rating: 4.8, distance: "1.5 km", image: "../imgs/rest3.png" },
  { name: "The Green Bowl", type: "Healthy Salads & Smoothies", rating: 4.5, distance: "2.1 km", image: "../imgs/rest4.png" },
  { name: "Delici", type: "Italian Delights", rating: 4.9, distance: "1.8 km", image: "../imgs/rest5.png" },
  { name: "Kovason", type: "Korean BBQ", rating: 4.7, distance: "2.5 km", image: "../imgs/rest6.png" },
  { name: "Mezban", type: "Traditional Biryani House", rating: 4.8, distance: "1.3 km", image: "../imgs/rest7.png" }
];

const container = document.querySelector(".restaurant-grid");

// Render restaurant cards
restaurants.forEach((res, index) => {
  const card = document.createElement("div");
  card.classList.add("restaurant-card");
  card.setAttribute("data-aos", "zoom-in");
  card.setAttribute("data-aos-delay", (index + 1) * 100);

  card.innerHTML = `
    <img src="${res.image}" alt="${res.name}" class="restaurant-img" />
    <div class="restaurant-info">
      <h3>${res.name}</h3>
      <p>${res.type}</p>
      <p><i class="fa-solid fa-star"></i> ${res.rating} | ${res.distance} away</p>
    </div>
  `;
  container.appendChild(card);
});

// ===== CART VALUE FROM LOCALSTORAGE =====
function updateCartDisplay() {
  const cartValue = document.querySelector('.cart-value');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartValue) {
    cartValue.textContent = totalItems;
  }
}

// Update cart on page load
updateCartDisplay();

// Listen for storage changes from other tabs/pages
window.addEventListener('storage', (e) => {
  if (e.key === 'cart') {
    updateCartDisplay();
  }
});