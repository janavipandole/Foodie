/**
 * Search Module
 * Manages menu card filtering, search input interactions, and URL search query parameter auto-population.
 */

/**
 * Filters menu cards based on the search query input value.
 */
export function searchFood() {
    if (typeof document === 'undefined') return;
    const searchInput = document.getElementById("search");
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    const menuCards = document.querySelectorAll(".order-card");

    menuCards.forEach(card => {
        const name = card.dataset.name ? card.dataset.name.toLowerCase() : '';
        if (name.includes(query)) {
            card.style.display = "block";          // Show matched card
            card.classList.add("active");          // Optional: add class for "open/expand"
        } else {
            card.style.display = "none";           // Hide unmatched card
            card.classList.remove("active");
        }
    });
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById("search");
        const searchBtn = document.getElementById("search-btn");

        // Trigger search on button click (if button exists)
        if (searchBtn) {
            searchBtn.addEventListener("click", searchFood);
        }

        // Trigger search on pressing "Enter"
        if (searchInput) {
            searchInput.addEventListener("keyup", (e) => {
                if (e.key === "Enter") searchFood();
            });
            
            // Check for search query in URL and auto-populate search input
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                const searchQuery = urlParams.get('search');
                if (searchQuery) {
                    searchInput.value = decodeURIComponent(searchQuery);
                    // Wait for menu cards to be loaded before searching
                    const menuCards = document.querySelectorAll(".order-card");
                    if (menuCards.length > 0) {
                        searchFood();
                    } else {
                        // If cards aren't loaded yet, wait for them
                        const observer = new MutationObserver((mutations, obs) => {
                            const cards = document.querySelectorAll(".order-card");
                            if (cards.length > 0) {
                                searchFood();
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
        }
    });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.searchFood = searchFood;
    window.searchModule = {
        searchFood
    };
}
