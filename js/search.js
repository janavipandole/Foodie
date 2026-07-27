const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

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

    menuCards.forEach(card => {
        const name = card.dataset.name ? card.dataset.name.toLowerCase() : '';
        if(name.includes(query)) {
            card.style.display = "block";          // Show matched card
            card.classList.add("active");          // Optional: add class for "open/expand"
        } else {
            card.style.display = "none";           // Hide unmatched card
            card.classList.remove("active");
        }
    });
}

const searchFood = debounce(searchFoodLogic, 300);

// Trigger search on button click (if button exists)
if (searchBtn) {
    searchBtn.addEventListener("click", searchFoodLogic);
}

// Trigger search on input (real-time with debounce)
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
            }
        }
    }
}