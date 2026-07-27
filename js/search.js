const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

// Create Auto-suggest dropdown container
const suggestContainer = document.createElement('div');
suggestContainer.className = 'auto-suggest-dropdown';
suggestContainer.style.position = 'absolute';
suggestContainer.style.background = 'var(--bg-color, white)';
suggestContainer.style.border = '1px solid var(--border-color, #ccc)';
suggestContainer.style.borderRadius = '4px';
suggestContainer.style.zIndex = '1000';
suggestContainer.style.maxHeight = '200px';
suggestContainer.style.overflowY = 'auto';
suggestContainer.style.display = 'none';
suggestContainer.style.width = '100%';

if (searchInput && searchInput.parentNode) {
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.appendChild(suggestContainer);
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Sanitization helper
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function searchFoodLogic() {
    if (!searchInput) return;
    const rawQuery = searchInput.value;
    const query = sanitizeHTML(rawQuery).toLowerCase();
    const menuCards = document.querySelectorAll(".order-card");
    
    suggestContainer.innerHTML = '';
    let matches = [];

    menuCards.forEach(card => {
        const name = card.dataset.name ? card.dataset.name.toLowerCase() : '';
        if(name.includes(query)) {
            card.style.display = "block";          // Show matched card
            card.classList.add("active");          // Optional: add class for "open/expand"
            if (query.trim() !== '') {
                matches.push(card.dataset.name);
            }
        } else {
            card.style.display = "none";           // Hide unmatched card
            card.classList.remove("active");
        }
    });

    if (matches.length > 0) {
        suggestContainer.style.display = 'block';
        matches.forEach(match => {
            const item = document.createElement('div');
            item.className = 'suggest-item';
            item.style.padding = '8px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid var(--border-color, #eee)';
            item.textContent = match;
            item.addEventListener('click', () => {
                searchInput.value = match;
                suggestContainer.style.display = 'none';
                searchFoodLogic();
            });
            suggestContainer.appendChild(item);
        });
    } else {
        suggestContainer.style.display = 'none';
    }
}

const searchFood = debounce(searchFoodLogic, 300);

// Hide suggest on outside click
document.addEventListener('click', (e) => {
    if (searchInput && !searchInput.contains(e.target) && !suggestContainer.contains(e.target)) {
        suggestContainer.style.display = 'none';
    }
});

// Trigger search on button click (if button exists)
if (searchBtn) {
    searchBtn.addEventListener("click", searchFoodLogic);
}

// Trigger search on typing (real-time with debounce)
if (searchInput) {
    searchInput.addEventListener("input", searchFood);
    
    // Check for search query in URL and auto-populate search input
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        searchInput.value = decodeURIComponent(searchQuery);
        // Wait for menu cards to be loaded before searching
        const menuCards = document.querySelectorAll(".order-card");
        if (menuCards.length > 0) {
            searchFoodLogic();
        } else {
            // If cards aren't loaded yet, wait for them
            const observer = new MutationObserver((mutations, obs) => {
                const cards = document.querySelectorAll(".order-card");
                if (cards.length > 0) {
                    searchFoodLogic();
                    obs.disconnect();
                }
            });
            const cardList = document.querySelector('.card-list');
            if (cardList) {
                observer.observe(cardList, {
                    childList: true,
                    subtree: true
                });
                
                // Fix for #698: Disconnect observer after timeout on non-search pages
                setTimeout(() => observer.disconnect(), 5000);
            }
        }
    }
}