/**
 * Nearby Restaurants Module
 * Handles theme toggles, scroll effects, hamburger navigation, restaurant card rendering with flip functionality, and cart updates.
 */

export const restaurants = [
    { name: "Spice Affair", type: "Authentic Indian Cuisine", rating: 4.7, distance: "1.2 km", image: "../imgs/rest1.webp", description: "Experience the rich heritage of Indian spices with our signature butter chicken and tandoori specialties." },
    { name: "Urban Eatery", type: "Modern Café & Grill", rating: 4.6, distance: "0.8 km", image: "../imgs/rest2.webp", description: "A trendy spot for artisan coffee, gourmet burgers, and farm-to-table breakfast options." },
    { name: "Sushi Haven", type: "Fresh Japanese Rolls", rating: 4.8, distance: "1.5 km", image: "../imgs/rest3.webp", description: "Premium seafood delivered daily. Our master chefs prepare authentic sushi and sashimi with precision." },
    { name: "The Green Bowl", type: "Healthy Salads & Smoothies", rating: 4.5, distance: "2.1 km", image: "../imgs/rest4.webp", description: "Fuel your body with nutrient-dense bowls, organic smoothies, and vegan-friendly treats." },
    { name: "Delici", type: "Italian Delights", rating: 4.9, distance: "1.8 km", image: "../imgs/rest5.webp", description: "Hand-tossed pizzas and homemade pasta sauces that bring a taste of Italy right to your doorstep." },
    { name: "Kovason", type: "Korean BBQ", rating: 4.7, distance: "2.5 km", image: "../imgs/rest6.webp", description: "Interactive dining experience featuring premium marinated meats and traditional banchan side dishes." },
    { name: "Mezban", type: "Traditional Biryani House", rating: 4.8, distance: "1.3 km", image: "../imgs/rest7.webp", description: "Specializing in Dum Biryani cooked with long-grain basmati rice and secret family spice blends." }
];

/**
 * Updates theme toggle button icons based on the active theme.
 * @param {string} theme - 'dark' or 'light'
 */
export function updateThemeIcon(theme) {
    if (typeof document === 'undefined') return;
    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    themeToggleBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (!icon) return;
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

/**
 * Renders restaurant cards into the container with flip functionality and AOS animations.
 * @param {Array} list - Array of restaurant objects
 * @param {HTMLElement} containerEl - DOM container element
 */
export function renderRestaurants(list = restaurants, containerEl) {
    if (typeof document === 'undefined') return;
    const container = containerEl || document.querySelector(".restaurant-grid");
    if (!container) return;

    container.innerHTML = '';
    list.forEach((res, index) => {
        const card = document.createElement("div");
        card.classList.add("restaurant-card");
        card.setAttribute("data-aos", "zoom-in");
        card.setAttribute("data-aos-delay", ((index + 1) * 100).toString());

        card.addEventListener('click', function() {
            this.classList.toggle('is-flipped');
        });

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${res.image}" alt="${res.name}" class="restaurant-img" />
                    <div class="restaurant-info">
                        <h3>${res.name}</h3>
                        <p>${res.type}</p>
                        <p><i class="fa-solid fa-star"></i> ${res.rating} | ${res.distance} away</p>
                    </div>
                </div>
                <div class="card-back">
                    <div class="restaurant-info">
                        <h3>About ${res.name}</h3>
                        <p class="para" style="font-size: 0.9rem; margin-bottom: 15px;">${res.description}</p>
                        <p><strong>Cuisine:</strong> ${res.type}</p>
                        <p><strong>Status:</strong> Open Now</p>
                        <a href="./menu.html" class="btn" style="margin-top: 20px; display: inline-block;">View Menu</a>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Updates the cart item count displayed in the DOM.
 */
export function updateCartDisplay() {
    if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;
    const cartValue = document.querySelector('.cart-value');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    if (cartValue) {
        cartValue.textContent = totalItems;
    }
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Theme initialization
        const themeToggleBtns = document.querySelectorAll('.theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);

        themeToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const activeTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
            });
        });

        // Navbar scroll effect
        const navbar = document.querySelector('header');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }

        // Hamburger menu toggle
        const hamburger = document.querySelector('.hamberger');
        const mobileMenu = document.querySelector('.mobile-menu');
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                mobileMenu.classList.toggle('mobile-menu-active');
            });
        }

        // Back to top button
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });

            const scrollToTop = (e) => {
                if (e) e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            backToTop.addEventListener('click', scrollToTop);
            backToTop.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToTop(e);
            });
        }

        // Render restaurants & initialize cart
        renderRestaurants();
        updateCartDisplay();

        // Listen for storage changes from other tabs/pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                updateCartDisplay();
            }
        });
    });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.updateCartDisplay = updateCartDisplay;
    window.renderRestaurants = renderRestaurants;
    window.updateThemeIcon = updateThemeIcon;
    window.nearbyResModule = {
        restaurants,
        updateCartDisplay,
        updateThemeIcon,
        renderRestaurants
    };
}
