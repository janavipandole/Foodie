# Multi-Language Support Implementation TODO

## Step 1: Create Translation Files
- [x] Create `locales/` directory
- [x] Create `locales/en.json` with English translations
- [x] Create `locales/hi.json` with Hindi translations

## Step 2: Create Internationalization Script
- [x] Create `js/i18n.js` for language loading, switching, and text replacement

## Step 3: Modify HTML Files
- [x] Update `html/index.html`: Add data-i18n attributes and language selector
- [x] Update `html/menu.html`: Add data-i18n attributes and language selector
- [x] Update translation files with menu-specific keys
- [x] Update `html/checkout.html`: Add data-i18n attributes and language selector
- [x] Update `html/aboutUs.html`: Add data-i18n attributes and language selector
- [x] Update `html/contactUs.html`: Add data-i18n attributes and language selector
- [x] Update `html/feedback.html`: Add data-i18n attributes and language selector
- [x] Update `html/forgot-password.html`: Add data-i18n attributes and language selector
- [x] Update `html/nearbyres.html`: Add data-i18n attributes and language selector
- [x] Update `html/PartnerWithUs.html`: Add data-i18n attributes and language selector
- [x] Update `html/signup.html`: Add data-i18n attributes and language selector
- [x] Update `html/supportCenter.html`: Add data-i18n attributes and language selector

## Step 4: Update JavaScript Files
- [x] Update `js/app.js`: Replace hardcoded strings with translation keys
- [ ] Update other JS files if needed (e.g., checkout.js, etc.)

## Step 5: Add Language Selector to Navbar
- [x] Ensure language selector is added to all HTML files' navbars
- [x] Style the language selector in CSS if necessary

## Step 6: Testing and Followup
- [x] Test language switching on different pages
- [x] Verify all text is properly translated and displayed
- [x] Ensure cart and other functionalities work in both languages
- [ ] Check localStorage persistence of language preference


# Order History Implementation TODO

- [x] Update checkout.html to save orders to localStorage on payment success
- [x] Create html/order-history.html with navbar and order display structure
- [x] Create js/order-history.js to load and render orders from localStorage
- [x] Create css/order-history.css for order history page styling
- [x] Update navbar in html/index.html to include Order History link
- [x] Update navbar in html/menu.html to include Order History link
- [ ] Test the full flow: add to cart, checkout, pay, view order history
