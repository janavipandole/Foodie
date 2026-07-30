/**
 * Category Module
 * Handles loading, grouping, sorting, and rendering of food cuisines/categories.
 */

// ===== LOADING STATE MANAGEMENT =====
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
        if (existingLoader) {
            existingLoader.remove();
        }
        element.classList.remove('loading');
    }
}

export function showRetryButton(container, retryFn, message = 'Retry') {
    const existingRetry = container.querySelector('.retry-btn');
    if (existingRetry) existingRetry.remove();

    const retryBtn = document.createElement('button');
    retryBtn.textContent = message;
    retryBtn.className = 'retry-btn';
    retryBtn.onclick = () => {
        retryBtn.remove();
        retryFn();
    };
    container.appendChild(retryBtn);
}

/**
 * Loads category products from products.json.
 */
export async function loadCategories() {
    const container = document.getElementById('categoryContainer');
    if (!container) return;

    try {
        setLoadingState(container, true, 'Loading cuisines...');

        const response = await fetch('/products.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const products = await response.json();

        setLoadingState(container, false);
        renderCategories(products, container);

    } catch (error) {
        setLoadingState(container, false);

        container.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1;">
                <div class="error-icon">⚠️</div>
                <h3>Unable to Load Cuisines</h3>
                <p>We're having trouble loading the cuisine categories right now. Please check your connection and try again.</p>
                <button class="retry-btn" onclick="loadCategories()" aria-label="Retry">Retry</button>
            </div>
        `;
    }
}

/**
 * Groups and renders categories into the given container.
 * @param {Array} products - Array of product objects
 * @param {HTMLElement} container - DOM container element
 */
export function renderCategories(products, container) {
    if (!container) return;

    const cuisineMap = {};

    products.forEach(product => {
        const cuisine = product.cuisine || 'Other';
        if (!cuisineMap[cuisine]) {
            cuisineMap[cuisine] = {
                name: cuisine,
                count: 0,
                image: product.image
            };
        }
        cuisineMap[cuisine].count++;
    });

    const categories = Object.values(cuisineMap).sort((a, b) => a.name.localeCompare(b.name));

    container.innerHTML = '';

    categories.forEach((cat, index) => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString());

        card.onclick = () => {
            window.location.href = `../html/menu.html?cuisine=${encodeURIComponent(cat.name)}`;
        };

        card.innerHTML = `
            <div class="category-image-container">
                <img src="${cat.image || '/images/fallback.jpg'}" 
                    alt="${cat.name} Cuisine" 
                    loading="lazy"
                    onerror="this.src='/images/fallback.jpg'">
            </div>
            <div class="category-info">
                <h2>${cat.name}</h2>
                <span class="category-count">${cat.count} Dishes</span>
            </div>
        `;

        container.appendChild(card);
    });
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out',
                once: true,
                offset: 50
            });
        }

        loadCategories();
    });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.loadCategories = loadCategories;
    window.renderCategories = renderCategories;
    window.setLoadingState = setLoadingState;
    window.showRetryButton = showRetryButton;
}
