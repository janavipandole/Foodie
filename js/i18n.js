// Internationalization (i18n) Module
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem("foodie:lang") || "en";
        this.translations = {};

        document.addEventListener("DOMContentLoaded", () => this.init());
    }

    async init() {
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.initLanguageSelector();
    }

    // Corrected translation path + optimized fallback handling
    async loadTranslations(lang) {
        try {
            const response = await fetch(`/locales/${lang}.json`);

            if (!response.ok) {
                throw new Error(`Could not load: ${lang}.json`);
            }

            this.translations = await response.json();
        } catch (err) {
            console.error("Translation load error:", err);

            // Fallback to EN if other language fails
            if (lang !== "en") {
                await this.loadTranslations("en");
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
