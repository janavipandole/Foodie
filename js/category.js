document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS animations
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

// ===== LOADING STATE MANAGEMENT =====
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
        if (existingLoader) {
            existingLoader.remove();
        }
        element.classList.remove('loading');
    }
}

function showRetryButton(container, retryFn, message = 'Retry') {
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

async function loadCategories() {
    const container = document.getElementById('categoryContainer');

    // Import error handling utilities
    const {
        retry,
        NetworkError,
        showErrorToast,
        errorLogger
    } = window.FoodieErrorHandler || {};

    try {
        setLoadingState(container, true, 'Loading cuisines...');

        // Use retry mechanism for fetching products
        const products = await retry(async () => {
            const response = await fetch('../products.json');
            if (!response.ok) {
                throw new NetworkError(`Failed to fetch products: HTTP ${response.status}`);
            }
            return await response.json();
        }, 3, 1000); // 3 retries with 1s delay

        setLoadingState(container, false);
        renderCategories(products, container);

    } catch (error) {
        setLoadingState(container, false);

        // Log the error
        errorLogger.log(error, { operation: 'loadCategories' });

        // Show user-friendly error message
        container.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1;">
                <div class="error-icon">⚠️</div>
                <h3>Unable to Load Cuisines</h3>
                <p>We're having trouble loading the cuisine categories right now. Please check your connection and try again.</p>
                <button class="retry-btn" onclick="loadCategories()">Retry</button>
            </div>
        `;

        // Show toast notification
        showErrorToast('Failed to load cuisines. Please try again.');
    }
}

function renderCategories(products, container) {
    // 1. Group products by Cuisine
    const cuisineMap = {};

    products.forEach(product => {
        const cuisine = product.cuisine || 'Other';
        if (!cuisineMap[cuisine]) {
            cuisineMap[cuisine] = {
                name: cuisine,
                count: 0,
                // Use the image of the first product found for this cuisine
                image: product.image
            };
        }
        cuisineMap[cuisine].count++;
    });

    // 2. Convert map to array and sort alphabetically
    const categories = Object.values(cuisineMap).sort((a, b) => a.name.localeCompare(b.name));

    // 3. Clear loading state
    container.innerHTML = '';

    // 4. Generate Cards
    categories.forEach((cat, index) => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString()); // Staggered animation

        // Clicking the card redirects to menu.html filtered by this cuisine
        // using the dedicated 'cuisine' parameter.
        card.onclick = () => {
            // Encode the cuisine name for the URL
            window.location.href = `../html/menu.html?cuisine=${encodeURIComponent(cat.name)}`;
        };

        card.innerHTML = `
            <div class="category-image-container">
                <img src="${cat.image}" alt="${cat.name} Cuisine" loading="lazy">
            </div>
            <div class="category-info">
                <h2>${cat.name}</h2>
                <span class="category-count">${cat.count} Dishes</span>
            </div>
        `;

        container.appendChild(card);
    });
}