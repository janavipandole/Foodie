// Internationalization (i18n) Module with Fallback Engine & Dynamic Node Observer
class I18n {
    constructor() {
        const storedLang = window.safeLocalStorage?.getItem("foodie:lang") || localStorage.getItem("foodie:lang");
        const browserLang = (navigator.language || navigator.userLanguage || "en").split("-")[0];
        this.currentLang = storedLang || (["en", "hi"].includes(browserLang) ? browserLang : "en");
        
/**
 * Internationalization (i18n) Module
 * Manages locale translations, dictionary fetching, and DOM string replacements.
 */

export class I18n {
    constructor() {
        this.currentLang = typeof localStorage !== 'undefined' ? (localStorage.getItem("foodie:lang") || "en") : "en";
        this.translations = {};
        this.fallbackTranslations = {};
        this.observer = null;

        if (typeof document !== 'undefined') {
            document.addEventListener("DOMContentLoaded", () => this.init());
        }
    }

    async init() {
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.initLanguageSelector();
        this.setupMutationObserver();
    }

    async loadTranslations(lang) {
        const errorHandler = typeof window !== 'undefined' ? window.FoodieErrorHandler : {};
        const {
            retry = async (fn) => fn(),
            NetworkError = Error,
            showErrorToast = console.error,
            errorLogger = { log: console.error }
        } = errorHandler || {};

        try {
            const isInsideHTML = typeof window !== 'undefined' && window.location.pathname.includes("/html/");
            const basePath = isInsideHTML ? "../locales/" : "./locales/";

            // Load primary language with retry
            this.translations = await retry(async () => {
                const response = await fetch(`${basePath}${lang}.json`);
                if (!response.ok) {
                    throw new NetworkError(`Failed to load ${lang}.json: HTTP ${response.status}`);
                }
                return await response.json();
            }, 2, 500);

            // Load English fallback if primary language is not English
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
                    if (errorLogger.log) errorLogger.log(fallbackError, { operation: 'loadFallbackTranslations', lang });
                    console.warn("Could not load English fallback translations:", fallbackError.message);
                }
            }
        } catch (err) {
            if (errorLogger.log) errorLogger.log(err, { operation: 'loadTranslations', lang });
            console.error("Translation load error:", err);

            if (lang !== "en") {
                try {
                    await this.loadTranslations("en");
                } catch (fallbackErr) {
                    if (errorLogger.log) errorLogger.log(fallbackErr, { operation: 'loadFallbackTranslations', fallbackLang: 'en' });
                    showErrorToast?.(this.t('i18n.loadFailed', {}, 'Failed to load language translations.'));
                }
            }
        }
    }

    // Smooth language switching
    async changeLanguage(lang) {
        if (lang === this.currentLang) return;

        this.currentLang = lang;
        if (window.safeLocalStorage) {
            window.safeLocalStorage.setItem("foodie:lang", lang);
        } else {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem("foodie:lang", lang);
        }

        await this.loadTranslations(lang);
        this.applyTranslations();
        this.updateLanguageSelector();
    }

    // Safe key lookup with parameter replacement & fallback
    t(key, params = {}, fallback = "") {
        let text = key.split(".").reduce((obj, k) => obj?.[k], this.translations)
            || key.split(".").reduce((obj, k) => obj?.[k], this.fallbackTranslations)
            || fallback
            || key;

        if (typeof params === "string") {
            fallback = params;
            params = {};
        }

        if (text && typeof params === "object") {
            Object.keys(params).forEach(p => {
                text = text.replace(new RegExp(`\\{${p}\\}`, "g"), params[p]);
            });
        }

        return text;
    }

    // Translate DOM nodes
    applyTranslations(container = document) {
    // Faster DOM translation (one pass)
    applyTranslations() {
        if (typeof document === 'undefined') return;

        const selectors = {
            text: "[data-i18n]",
            placeholder: "[data-i18n-placeholder]",
            title: "[data-i18n-title]",
            aria: "[data-i18n-aria-label]"
        };

        container.querySelectorAll?.(selectors.text).forEach(el => {
            const key = el.dataset.i18n;
            const translated = this.t(key);

            if (el.tagName === "IMG") {
                el.alt = translated;
            } else {
                const icon = el.querySelector('i');
                if (icon) {
                    const iconHtml = icon.outerHTML;
                    el.innerHTML = `${iconHtml} ${translated}`;
                } else {
                    el.textContent = translated;
                }
            }
        });

        container.querySelectorAll?.(selectors.placeholder).forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });

        container.querySelectorAll?.(selectors.title).forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });

        container.querySelectorAll?.(selectors.aria).forEach(el => {
            el.setAttribute("aria-label", this.t(el.dataset.i18nAriaLabel));
        });

        document.documentElement.lang = this.currentLang;

        window.dispatchEvent(new CustomEvent("languageChanged", {
            detail: {
                language: this.currentLang,
                translations: this.translations
            }
        }));
        // Update HTML lang
        if (document.documentElement) {
            document.documentElement.lang = this.currentLang;
        }

        // Notify other scripts
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent("languageChanged", {
                detail: {
                    language: this.currentLang,
                    translations: this.translations
                }
            }));
        }
    }

    // Dynamic Node Observer
    setupMutationObserver() {
        if (this.observer) this.observer.disconnect();

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.applyTranslations(node);
                    }
                });
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initLanguageSelector() {
        if (typeof document === 'undefined') return;
        const selector = document.querySelector("#language-select");
        if (!selector) return;

        selector.value = this.currentLang;
        selector.addEventListener("change", e => {
            this.changeLanguage(e.target.value);
        });
    }

    updateLanguageSelector() {
        if (typeof document === 'undefined') return;
        const selector = document.querySelector("#language-select");
        if (selector) selector.value = this.currentLang;
    }
}

// Global instance
window.i18n = new I18n();
window.t = (key, params = {}, fallback = "") => window.i18n?.t(key, params, fallback) || fallback || key;
export const i18n = new I18n();

/**
 * Global helper translation function
 */
export function t(key, fallback = "") {
    return i18n?.t(key, fallback) || fallback || key;
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.I18n = I18n;
    window.i18n = i18n;
    window.t = t;
}
