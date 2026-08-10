/**
 * Reusable Dynamic Live Search and Multi-Category Filtering Component
 */

class LiveSearchFilterComponent {
  constructor(config = {}) {
    this.searchInputId = config.searchInputId || 'search';
    this.cardSelector = config.cardSelector || '.order-card';
    this.categorySelector = config.categorySelector || '.category-btn';
    this.debounceMs = config.debounceMs || 300;

    this.activeCategory = 'all';
    this.debounceTimer = null;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    this.searchInput = document.getElementById(this.searchInputId);
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.onSearchInput());
    }

    document.querySelectorAll(this.categorySelector).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.dataset.category || 'all';
        this.selectCategory(cat, e.currentTarget);
      });
    });
  }

  onSearchInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filterCards();
    }, this.debounceMs);
  }

  selectCategory(category, element) {
    this.activeCategory = category;
    document.querySelectorAll(this.categorySelector).forEach(b => b.classList.remove('active'));
    if (element) element.classList.add('active');
    this.filterCards();
  }

  filterCards() {
    const query = (this.searchInput ? this.searchInput.value : '').toLowerCase().trim();
    const cards = document.querySelectorAll(this.cardSelector);

    cards.forEach(card => {
      const name = (card.dataset.name || card.querySelector('h3, h4')?.textContent || '').toLowerCase();
      const cardCategory = (card.dataset.category || 'all').toLowerCase();

      const textMatch = !query || name.includes(query);
      const categoryMatch = this.activeCategory === 'all' || cardCategory === this.activeCategory.toLowerCase();

      if (textMatch && categoryMatch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

window.liveSearchFilterComponent = new LiveSearchFilterComponent();
