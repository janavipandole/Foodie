/**
 * Main Application Module
 * Encapsulates state management and exports initialization helpers cleanly.
 */

// Encapsulated state management (preventing global scope pollution)
const appState = {
  productsPath: '../products.json',
  isUsingServer: typeof window !== 'undefined' ? window.location.protocol !== 'file:' : false,
  loadingStates: new Map()
};

export const _retry = async (fn) => fn();

export function setLoadingState(element, isLoading, message = 'Loading...') {
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

// ===== THEME TOGGLE LOGIC =====
export const updateThemeIcons = (theme, themeToggles = document.querySelectorAll('.theme-toggle')) => {
    themeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        const label = toggle.querySelector('span');
        if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
};

export const toggleTheme = (themeToggles = document.querySelectorAll('.theme-toggle')) => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    
    html.classList.add('theme-transition');
    if (next === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
    
    if (window.safeLocalStorage) {
        window.safeLocalStorage.setItem('theme', next);
    } else {
        localStorage.setItem('theme', next);
    }
    updateThemeIcons(next);
    localStorage.setItem('theme', next);
    updateThemeIcons(next, themeToggles);
    setTimeout(() => html.classList.remove('theme-transition'), 600);
};

// ===== AUTH & PROFILE UI =====
function updateNavbarProfile() {
    const user = window.safeLocalStorage ? window.safeLocalStorage.getItem('loggedInUser') : JSON.parse(localStorage.getItem('loggedInUser') || 'null');
export function updateNavbarProfile() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const authBtns = document.querySelectorAll('.btn[href*="signup.html"]');
    
    if (document.querySelector('.user-profile-badge')) return;

    if (user && authBtns.length > 0) {
        authBtns.forEach(btn => {
            const profileBadge = document.createElement('div');
            profileBadge.className = 'user-profile-badge';
            profileBadge.innerHTML = `
                <img src="${user.picture || '../imgs/profile1.webp'}" alt="Profile" class="user-avatar-small">
                <span class="user-name-text">${(user.name || 'User').split(' ')[0]}</span>
                <i class="fa-solid fa-chevron-down ms-1"></i>
                <div class="profile-dropdown">
                    <a href="./profile.html"><i class="fa-solid fa-user-gear"></i> Profile</a>
                    <a href="#" id="logout-link"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
                </div>
            `;
            btn.parentNode.replaceChild(profileBadge, btn);
            
            const logoutLink = profileBadge.querySelector('#logout-link');
            logoutLink?.addEventListener('click', logoutUser);
        });
    }
}

function logoutUser(e) {
    e.preventDefault();
    if (window.safeLocalStorage) {
        window.safeLocalStorage.removeItem('loggedInUser');
    } else {
        localStorage.removeItem('loggedInUser');
    }
export function logoutUser(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.reload();
}

// ===== ACTIVE NAVIGATION LINK HIGHLIGHTING =====
export function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navList a, .mobile-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkPage = href ? href.split('/').pop() : '';
        
        link.parentElement?.classList.remove('active');
        
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html#home')) {
            link.parentElement?.classList.add('active');
        }
    });
}

// ===== THROTTLED SCROLL & TEARDOWN CLEANUP =====
let scrollHandler = null;

function setupScrollPerformance() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;

    const throttleFn = window.throttle || ((fn, delay) => {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= delay) {
                last = now;
                fn(...args);
            }
        };
    });

    scrollHandler = throttleFn(() => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });
}

// Global Exception Catchers
window.addEventListener('unhandledrejection', (event) => {
    if (window.errorLogger) {
        window.errorLogger.log(event.reason, { type: 'UNHANDLED_REJECTION' });
    }
});

// Teardown Handler
window.addEventListener('beforeunload', () => {
    if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
    }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const theme = (window.safeLocalStorage ? window.safeLocalStorage.getItem('theme') : localStorage.getItem('theme')) || 'light';
    updateThemeIcons(theme);
    themeToggles.forEach(btn => btn.addEventListener('click', toggleTheme));
export function initializeApp() {
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const theme = localStorage.getItem('theme') || 'light';
    updateThemeIcons(theme, themeToggles);
    themeToggles.forEach(btn => btn.addEventListener('click', () => toggleTheme(themeToggles)));

    updateNavbarProfile();
    setupScrollPerformance();

    const hamburger = document.querySelector('.hamberger');
    const mobileMenu = document.querySelector('.mobile-menu');
    hamburger?.addEventListener('click', (e) => {
        e.preventDefault();
        mobileMenu?.classList.toggle("mobile-menu-active");
        const icon = hamburger.querySelector('i');
        icon?.classList.toggle("fa-xmark");
        icon?.classList.toggle("fa-bars");
    });

    function highlightActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.navList a, .mobile-menu a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkPage = href ? href.split('/').pop() : '';
            link.parentElement?.classList.remove('active');
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html#home')) {
                link.parentElement?.classList.add('active');
            }
        });
    }
    
    highlightActiveNavLink();
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeApp);
}
