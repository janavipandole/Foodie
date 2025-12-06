// js/category.js

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

async function loadCategories() {
    const container = document.getElementById('categoryContainer');
    const productsUrl = '../products.json';

    try {
        const response = await fetch(productsUrl);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        renderCategories(products, container);
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = `
            <div style="text-align:center; grid-column: 1/-1; color: var(--text-secondary);">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Unable to load cuisines at this time.</p>
            </div>
        `;
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
        // (Assuming menu.html can handle query params like ?cuisine=Italian)
        // Since standard menu.html might not have query param logic built-in yet, 
        // we'll just link to menu.html or a specific anchor.
        
        // However, to make it functional based on your existing app.js:
        // You might need to update app.js to read ?search=CuisineName or similar.
        // For now, we link to menu.html.
        card.onclick = () => {
            // Encode the cuisine name for the URL
            window.location.href = `menu.html?search=${encodeURIComponent(cat.name)}`;
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