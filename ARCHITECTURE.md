# Foodie — System Architecture, i18n Schema & Wrangler Deployment Specification

## 1. Overview
**Foodie** is a client-side food delivery and ordering web application built with Vanilla HTML5, CSS3, and JavaScript (ES6+). It features multi-language translation (English and Hindi), theme customization, offline PWA capabilities, and Cloudflare Pages/Workers serverless deployment.

---

## 2. Cloudflare Wrangler Deployment Guide

Foodie uses **Cloudflare Wrangler** for serverless Workers/Pages deployment.

### 2.1 Prerequisites
Ensure Wrangler CLI is installed:
```bash
npm install -g wrangler
```

### 2.2 Local Development Preview
Run local edge preview server:
```bash
npm run preview
```

### 2.3 Cloudflare Deployment
Deploy to Cloudflare edge:
```bash
npm run deploy
```

---

## 3. i18n Translation Schema & Structure

Translation files reside in `locales/`:
- `locales/en.json` (Primary English catalog)
- `locales/hi.json` (Hindi translation catalog)

### 3.1 Translation JSON Key Format
```json
{
  "nav": {
    "home": "Home",
    "menu": "Menu",
    "favorites": "Favorites"
  },
  "auth": {
    "welcomeBack": "Welcome back, {name}!"
  }
}
```

---

## 4. System Components Architecture

```
Foodie Architecture
├── UI Layer (HTML5, Vanilla CSS, FontAwesome)
├── State Layer (CartStore, safeLocalStorage, IndexedDB)
├── i18n Engine (i18n.js, MutationObserver, Locales JSON)
└── Edge Layer (Cloudflare Workers, Wrangler API)
```
