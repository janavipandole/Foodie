/**
 * Popular Page Module
 * Handles AOS (Animate On Scroll) library initialization and configuration.
 */

/**
 * Initializes AOS animations with preset options.
 * @returns {Object|null} Initialized AOS instance or null if AOS is unavailable
 */
export function initAOS() {
    if (typeof window !== 'undefined' && typeof AOS !== 'undefined' && typeof AOS.init === 'function') {
        return AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 100
        });
    }
    return null;
}

/**
 * Initializes popular page features and animations.
 */
export function initPopularPage() {
    return initAOS();
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initPopularPage();
    });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.initAOS = initAOS;
    window.initPopularPage = initPopularPage;
    window.popularModule = {
        initAOS,
        initPopularPage
    };
}
