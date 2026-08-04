/**
 * Advanced Client-Side Search & Multi-Tag Indexing Module
 * Features: Inverted Index search, 300ms debouncing, multi-tag chips, empty state handling.
 */

class FoodSearchEngine {
    constructor() {
        this.index = new Map();
        this.activeTags = new Set();
        this.debounceTimer = null;
        this.products = [];
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindElements();
            this.buildIndexFromDOM();
            this.setupUrlSearch();
        });
    }

    bindElements() {
        this.searchInput = document.getElementById("search");
        this.searchBtn = document.getElementById("search-btn");
        this.cardContainer = document.querySelector(".card-list") || document.querySelector(".menu-grid");
        this.tagsContainer = document.getElementById("search-active-tags");

        if (this.searchInput) {
            this.searchInput.addEventListener("input", () => this.handleDebouncedInput());
            this.searchInput.addEventListener("keyup", (e) => {
                if (e.key === "Enter") this.executeSearch();
            });
        }

        if (this.searchBtn) {
            this.searchBtn.addEventListener("click", () => this.executeSearch());
        }

        // Bind filter tag click listeners
        document.querySelectorAll("[data-filter-tag]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const tag = e.currentTarget.dataset.filterTag;
                this.toggleTag(tag, e.currentTarget);
            });
        });
    }

    /**
     * Builds an inverted search index across cards in DOM
     */
    buildIndexFromDOM() {
        const cards = document.querySelectorAll(".order-card");
        cards.forEach((card, idx) => {
            const name = (card.dataset.name || card.querySelector("h3, h4, .food-title")?.textContent || "").toLowerCase();
            const category = (card.dataset.category || "").toLowerCase();
            const tags = (card.dataset.tags || "").toLowerCase();
            const desc = (card.querySelector(".desc, p")?.textContent || "").toLowerCase();

            const combinedText = `${name} ${category} ${tags} ${desc}`;
            const tokens = Array.from(new Set(combinedText.match(/\w+/g) || []));

            tokens.forEach(token => {
                if (!this.index.has(token)) {
                    this.index.set(token, new Set());
                }
                this.index.get(token).add(card);
            });
        });
    }

    handleDebouncedInput() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.executeSearch();
        }, 300);
    }

    toggleTag(tag, element) {
        if (this.activeTags.has(tag)) {
            this.activeTags.delete(tag);
            if (element) element.classList.remove("active-tag");
        } else {
            this.activeTags.add(tag);
            if (element) element.classList.add("active-tag");
        }
        this.renderTagChips();
        this.executeSearch();
    }

    renderTagChips() {
        if (!this.tagsContainer) return;
        this.tagsContainer.innerHTML = "";

        this.activeTags.forEach(tag => {
            const chip = document.createElement("span");
            chip.className = "filter-chip";
            chip.innerHTML = `${tag} <i class="fa-solid fa-xmark remove-chip" data-tag="${tag}"></i>`;
            chip.querySelector(".remove-chip").addEventListener("click", () => {
                this.toggleTag(tag);
            });
            this.tagsContainer.appendChild(chip);
        });
    }

    executeSearch() {
        const query = (this.searchInput ? this.searchInput.value : "").trim().toLowerCase();
        const cards = document.querySelectorAll(".order-card");
        let visibleCount = 0;

        cards.forEach(card => {
            const name = (card.dataset.name || card.querySelector("h3, h4, .food-title")?.textContent || "").toLowerCase();
            const category = (card.dataset.category || "").toLowerCase();
            const tags = (card.dataset.tags || "").toLowerCase();
            const desc = (card.querySelector(".desc, p")?.textContent || "").toLowerCase();

            const textMatch = !query || name.includes(query) || category.includes(query) || tags.includes(query) || desc.includes(query);

            let tagMatch = true;
            if (this.activeTags.size > 0) {
                this.activeTags.forEach(activeTag => {
                    const lowTag = activeTag.toLowerCase();
                    if (!tags.includes(lowTag) && !category.includes(lowTag) && !name.includes(lowTag)) {
                        tagMatch = false;
                    }
                });
            }

            if (textMatch && tagMatch) {
                card.style.display = "block";
                card.classList.add("active");
                visibleCount++;
            } else {
                card.style.display = "none";
                card.classList.remove("active");
            }
        });

        this.updateEmptyState(visibleCount);
    }

    updateEmptyState(visibleCount) {
        if (!this.cardContainer) return;

        let emptyEl = document.getElementById("search-empty-state");
        if (visibleCount === 0) {
            if (!emptyEl) {
                emptyEl = document.createElement("div");
                emptyEl.id = "search-empty-state";
                emptyEl.className = "search-empty-state";
                emptyEl.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #888;">
                        <i class="fa-solid fa-utensils" style="font-size: 3rem; margin-bottom: 16px; color: #ccc;"></i>
                        <h3>No matching dishes found</h3>
                        <p style="font-size: 0.9rem; margin-top: 8px;">Try searching for another dish or clearing selected filter tags.</p>
                    </div>
                `;
                this.cardContainer.appendChild(emptyEl);
            }
            emptyEl.style.display = "block";
        } else if (emptyEl) {
            emptyEl.style.display = "none";
        }
    }

    setupUrlSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery && this.searchInput) {
            this.searchInput.value = decodeURIComponent(searchQuery);
            setTimeout(() => this.executeSearch(), 200);
        }
    }
}

// Instantiate global search engine
window.foodSearchEngine = new FoodSearchEngine();