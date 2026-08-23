/**
 * Dynamic Translation Chunk Engine Architecture
 * Features: Lazy-loaded translation namespaces, MutationObserver DOM translation, and parameter interpolation.
 */

class I18nChunkEngine {
  constructor() {
    this.currentLanguage = localStorage.getItem('foodie:lang') || 'en';
    this.loadedChunks = new Map();
    this.observer = null;
    this.init();
  }

  async init() {
    await this.loadChunk('common', this.currentLanguage);
    this.translateDOM();
    this.setupMutationObserver();
  }

  /**
   * Lazy load namespace translation chunk
   */
  async loadChunk(namespace, lang = this.currentLanguage) {
    const chunkKey = `${lang}:${namespace}`;
    if (this.loadedChunks.has(chunkKey)) {
      return this.loadedChunks.get(chunkKey);
    }

    try {
      const isInsideHTML = window.location.pathname.includes('/html/');
      const basePath = isInsideHTML ? '../locales/' : './locales/';
      const response = await fetch(`${basePath}${lang}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.loadedChunks.set(chunkKey, data);
      return data;
    } catch (err) {
      console.warn(`Failed loading i18n chunk: ${chunkKey}`, err);
      return {};
    }
  }

  /**
   * Translate key with parameter interpolation
   * Example: t('welcome.user', { name: 'John' })
   */
  translate(key, params = {}, fallback = '') {
    const chunkKey = `${this.currentLanguage}:common`;
    const catalog = this.loadedChunks.get(chunkKey) || {};

    let text = key.split('.').reduce((acc, k) => acc?.[k], catalog) || fallback || key;

    if (typeof params === 'object' && params !== null) {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      });
    }

    return text;
  }

  /**
   * Deep DOM Translation
   */
  translateDOM(container = document) {
    container.querySelectorAll?.('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translated = this.translate(key);
      const icon = el.querySelector('i');

      if (icon) {
        const iconHtml = icon.outerHTML;
        el.innerHTML = `${iconHtml} ${translated}`;
      } else {
        el.textContent = translated;
      }
    });
  }

  /**
   * MutationObserver for dynamic nodes
   */
  setupMutationObserver() {
    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.translateDOM(node);
          }
        });
      });
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }
}

window.i18nChunkEngine = new I18nChunkEngine();
