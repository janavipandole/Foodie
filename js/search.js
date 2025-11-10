const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

function searchFood() {
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase();
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

// Trigger search on button click (if button exists)
if (searchBtn) {
    searchBtn.addEventListener("click", searchFood);
}

// Trigger search on pressing "Enter"
if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        if(e.key === "Enter") searchFood();
    });
    
    // Check for search query in URL and auto-populate search input
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