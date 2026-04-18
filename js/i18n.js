// Internationalization (i18n) Module
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem("foodie:lang") || "en";
        this.translations = {};
        this.fallbackTranslations = {};

        document.addEventListener("DOMContentLoaded", () => this.init());
    }

    async init() {
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.initLanguageSelector();
    }

    // Corrected translation path + optimized fallback handling with error handling
    async loadTranslations(lang) {
        // Import error handling utilities
        const {
            retry,
            NetworkError,
            showErrorToast,
            errorLogger
        } = window.FoodieErrorHandler || {};

        try {
            const isInsideHTML = window.location.pathname.includes("/html/");
            const basePath = isInsideHTML ? "../locales/" : "./locales/";

            // Load primary language with retry
            this.translations = await retry(async () => {
                const response = await fetch(`${basePath}${lang}.json`);
                if (!response.ok) {
                    throw new NetworkError(`Failed to load ${lang}.json: HTTP ${response.status}`);
                }
                return await response.json();
            }, 2, 500); // 2 retries with 500ms delay

            // Load English fallback if needed
            if (lang !== "en" && Object.keys(this.fallbackTranslations).length === 0) {
                try {
                    this.fallbackTranslations = await retry(async () => {
                        const fallbackResponse = await fetch(`${basePath}en.json`);
                        if (!fallbackResponse.ok) {
                            throw new NetworkError(`Failed to load en.json fallback: HTTP ${fallbackResponse.status}`);
                        }
                        return await fallbackResponse.json();
                    }, 2, 500);
                } catch (fallbackError) {
                    errorLogger.log(fallbackError, { operation: 'loadFallbackTranslations', lang });
                    console.warn("Could not load English fallback translations:", fallbackError.message);
                }
            }

        } catch (err) {
            errorLogger.log(err, { operation: 'loadTranslations', lang });

            console.error("Translation load error:", err);

            // Fallback to EN if other language fails
            if (lang !== "en") {
                try {
                    await this.loadTranslations("en");
                } catch (fallbackErr) {
                    errorLogger.log(fallbackErr, { operation: 'loadFallbackTranslations', fallbackLang: 'en' });
                    console.error("Critical: Could not load any translations:", fallbackErr);
                    showErrorToast('Failed to load language translations. Some text may appear in English.');
                }
            }
        }
    }

    // Smooth language switching
    async changeLanguage(lang) {
        if (lang === this.currentLang) return;

        this.currentLang = lang;
        localStorage.setItem("foodie:lang", lang);

        await this.loadTranslations(lang);
        this.applyTranslations();
        this.updateLanguageSelector();
    }

    // Safe key lookup with fallback
    t(key, fallback = "") {
        return key.split(".").reduce((obj, k) => obj?.[k], this.translations)
            || key.split(".").reduce((obj, k) => obj?.[k], this.fallbackTranslations)
            || fallback
            || key;
    }

    // Faster DOM translation (one pass)
    applyTranslations() {
        const selectors = {
            text: "[data-i18n]",
            placeholder: "[data-i18n-placeholder]",
            title: "[data-i18n-title]",
            aria: "[data-i18n-aria-label]"
        };

        // Translate text and images
        document.querySelectorAll(selectors.text).forEach(el => {
            const key = el.dataset.i18n;
            const translated = this.t(key);

            if (el.tagName === "IMG") {
                el.alt = translated;
            } else {
                el.textContent = translated;
            }
        });

        // Translate placeholders
        document.querySelectorAll(selectors.placeholder).forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });

        // Translate title attributes
        document.querySelectorAll(selectors.title).forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });

        // Translate aria-label
        document.querySelectorAll(selectors.aria).forEach(el => {
            el.setAttribute("aria-label", this.t(el.dataset.i18nAriaLabel));
        });

        // Update HTML lang
        document.documentElement.lang = this.currentLang;

        // Notify other scripts
        window.dispatchEvent(new CustomEvent("languageChanged", {
            detail: {
                language: this.currentLang,
                translations: this.translations
            }
        }));
    }

    // Initialize dropdown <select id="language-select">
    initLanguageSelector() {
        const selector = document.querySelector("#language-select");
        if (!selector) return;

        selector.value = this.currentLang;

        selector.addEventListener("change", e => {
            this.changeLanguage(e.target.value);
        });
    }

    updateLanguageSelector() {
        const selector = document.querySelector("#language-select");
        if (selector) selector.value = this.currentLang;
    }
}

// Global instance
window.i18n = new I18n();
