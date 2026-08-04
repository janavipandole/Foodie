// ===== FIX: Define missing variables =====
let productsPath = '../products.json';
const isUsingServer = window.location.protocol !== 'file:';
const _retry = async (fn) => fn();

// ===== SERVICE WORKER PWA REGISTRATION =====
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('PWA ServiceWorker registered with scope:', registration.scope);
    }).catch((err) => {
      console.warn('PWA ServiceWorker registration failed:', err);
    });
  });
}

// ===== LOADING STATE MANAGEMENT =====
let loadingStates = new Map();

function setLoadingState(element, isLoading, message = 'Loading...') {
  if (!element) return;
  const existingLoader = element.querySelector('.loading-overlay');
  if (isLoading) {
    if (!existingLoader) {
      const loader = document.createElement('div');
      loader.className = 'loading-overlay';
      loader.innerHTML = `
        <div class="loading-spinner"></div>
        <span class="loading-text">${message}</span>
      `;
      element.style.position = 'relative';
      element.appendChild(loader);
    }
    element.classList.add('loading');
  } else {
    if (existingLoader) existingLoader.remove();
    element.classList.remove('loading');
  }
}

// ===== ELEMENT SELECTORS =====
const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const cartValue = document.querySelector('.cart-value');
const hamburger = document.querySelector('.hamberger');
const mobileMenu = document.querySelector('.mobile-menu');
const themeToggles = document.querySelectorAll('.theme-toggle');

// ===== THEME TOGGLE LOGIC =====
const updateThemeIcons = (theme) => {
    themeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        const label = toggle.querySelector('span');
        if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
};

const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    
    html.classList.add('theme-transition');
    if (next === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
    
    localStorage.setItem('theme', next);
    updateThemeIcons(next);
    setTimeout(() => html.classList.remove('theme-transition'), 600);
};

// ===== AUTH & PROFILE UI =====
function updateNavbarProfile() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const authBtns = document.querySelectorAll('.btn[href*="signup.html"]');
    
    // Check if badge already exists to prevent duplication
    if (document.querySelector('.user-profile-badge')) return;

    if (user && authBtns.length > 0) {
        authBtns.forEach(btn => {
            const profileBadge = document.createElement('div');
            profileBadge.className = 'user-profile-badge';
            profileBadge.innerHTML = `
                <img src="${user.picture || '../imgs/profile1.webp'}" alt="Profile" class="user-avatar-small">
                <span class="user-name-text">${user.name.split(' ')[0]}</span>
                <i class="fa-solid fa-chevron-down ms-1"></i>
                <div class="profile-dropdown">
                    <a href="./profile.html"><i class="fa-solid fa-user-gear"></i> Profile</a>
                    <a href="#" onclick="logoutUser(event)"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
                </div>
            `;
            btn.parentNode.replaceChild(profileBadge, btn);
        });
    }
}

function logoutUser(e) {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.reload();
}
window.logoutUser = logoutUser;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Theme Init
    const theme = localStorage.getItem('theme') || 'light';
    updateThemeIcons(theme);
    themeToggles.forEach(btn => btn.addEventListener('click', toggleTheme));

    // Profile Init
    updateNavbarProfile();

    // Mobile Menu
    hamburger?.addEventListener('click', (e) => {
        e.preventDefault();
        mobileMenu?.classList.toggle("mobile-menu-active");
        const icon = hamburger.querySelector('i');
        icon?.classList.toggle("fa-xmark");
        icon?.classList.toggle("fa-bars");
    });

    // ===== ACTIVE NAVIGATION LINK HIGHLIGHTING =====
    function highlightActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.navList a, .mobile-menu a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkPage = href.split('/').pop();
            
            // Remove active class from all links
            link.parentElement?.classList.remove('active');
            
            // Add active class to matching link
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html#home')) {
                link.parentElement?.classList.add('active');
            }
        });
    }
    
    highlightActiveNavLink();
});
