/**
 * Foodie Accessibility (a11y) & Focus Trap Manager
 * Features: Screen reader announcements, modal focus trap loop, ARIA state bindings, Escape key dismiss.
 */

class FoodieA11yManager {
  constructor() {
    this.activeModal = null;
    this.previousFocusedElement = null;
    this.liveRegion = null;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    this.createLiveRegion();
    this.setupGlobalKeyboardListeners();
  }

  /**
   * ARIA Live Region Announcement for Screen Readers
   */
  createLiveRegion() {
    if (document.getElementById('a11y-live-region')) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.id = 'a11y-live-region';
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.cssText = 'position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); border:0;';

    document.body.appendChild(this.liveRegion);
  }

  announce(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
    }
  }

  /**
   * Modal Focus Trap Management
   */
  trapFocus(modalElement) {
    if (!modalElement) return;

    this.previousFocusedElement = document.activeElement;
    this.activeModal = modalElement;

    modalElement.setAttribute('role', 'dialog');
    modalElement.setAttribute('aria-modal', 'true');

    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    const focusableElements = Array.from(modalElement.querySelectorAll(focusableSelectors));

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    this.keyHandler = (e) => {
      if (e.key === 'Escape') {
        this.releaseFocus();
        return;
      }

      if (e.key === 'Tab') {
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    modalElement.addEventListener('keydown', this.keyHandler);
    this.announce(`Dialog ${modalElement.getAttribute('aria-label') || ''} opened`);
  }

  releaseFocus() {
    if (!this.activeModal) return;

    if (this.keyHandler) {
      this.activeModal.removeEventListener('keydown', this.keyHandler);
    }

    this.activeModal.style.display = 'none';
    this.announce('Dialog closed');

    if (this.previousFocusedElement) {
      this.previousFocusedElement.focus();
    }

    this.activeModal = null;
    this.previousFocusedElement = null;
  }

  setupGlobalKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.releaseFocus();
      }
    });
  }
}

// Global A11y Instance
window.foodieA11y = new FoodieA11yManager();
