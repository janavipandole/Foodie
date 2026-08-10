/**
 * Theme Manager & FOUC (Flash of Unstyled Content) Prevention System
 */

(function () {
  'use strict';

  // Immediate execution before DOM render to prevent FOUC
  const applyInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme') || localStorage.getItem('foodie:theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');

      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } catch (e) {
      console.warn('Theme init error:', e);
    }
  };

  applyInitialTheme();

  class ThemeManager {
    constructor() {
      this.init();
    }

    init() {
      document.addEventListener('DOMContentLoaded', () => {
        this.bindToggles();
        this.updateIcons();
      });
    }

    getTheme() {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    setTheme(theme) {
      const html = document.documentElement;
      html.classList.add('theme-transition');

      if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
      } else {
        html.removeAttribute('data-theme');
      }

      try {
        localStorage.setItem('theme', theme);
        localStorage.setItem('foodie:theme', theme);
      } catch (e) {}

      this.updateIcons();
      setTimeout(() => html.classList.remove('theme-transition'), 500);
    }

    toggleTheme() {
      const next = this.getTheme() === 'dark' ? 'light' : 'dark';
      this.setTheme(next);
    }

    updateIcons() {
      const current = this.getTheme();
      document.querySelectorAll('.theme-toggle i, #themeToggle i').forEach(icon => {
        icon.className = current === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      });
    }

    bindToggles() {
      document.querySelectorAll('.theme-toggle, #themeToggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleTheme();
        });
      });
    }
  }

  window.themeManager = new ThemeManager();
})();
