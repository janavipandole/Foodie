// Internationalization (i18n) Module
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('foodie:lang') || 'en';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.createLanguageSelector();
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`../locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang} translations`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English if loading fails
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
    }

    async changeLanguage(lang) {
        if (lang === this.currentLang) return;

        this.currentLang = lang;
        localStorage.setItem('foodie:lang', lang);
        await this.loadTranslations(lang);
        this.applyTranslations();
        this.updateLanguageSelector();
    }

    t(key, fallback = '') {
        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            value = value && value[k];
        }

        return value || fallback || key;
    }

    applyTranslations() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else if (element.tagName === 'IMG' && element.hasAttribute('alt')) {
                element.alt = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Translate elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Translate elements with data-i18n-aria-label attribute
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.t(key));
        });

        // Update document language attribute
        document.documentElement.lang = this.currentLang;

        // Dispatch custom event for other scripts to react to language change
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang, translations: this.translations }
        }));
    }

    createLanguageSelector() {
        const select = document.querySelector('#language-select');
        if (select) {
            select.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
            this.updateLanguageSelector();
        }
    }

    updateLanguageSelector() {
        const select = document.querySelector('#language-select');
        if (select) {
            select.value = this.currentLang;
        }
    }
}

// Global i18n instance
const i18n = new I18n();

// Make i18n available globally for other scripts
window.i18n = i18n;
