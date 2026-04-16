# Fix Applied for Issue #318

## Problem
Footer links were using `../HTML/` (uppercase) but the actual folder is `html` (lowercase), causing 404 errors on case-sensitive systems.

## Files that need fixing:
All HTML files in the `html/` directory have footer links with incorrect case:
- `../HTML/PartnerWithUs.html` → `../html/PartnerWithUs.html`
- `../HTML/aboutUs.html` → `../html/aboutUs.html`
- `../HTML/contactUs.html` → `../html/contactUs.html`
- `../HTML/signup.html` → `../html/signup.html`
- `../HTML/supportCenter.html` → `../html/supportCenter.html`
- `../HTML/feedback.html` → `../html/feedback.html`
- `../HTML/index.html` → `../html/index.html`

## Solution
Replace all instances of `../HTML/` with `../html/` in footer sections.

## Testing
After this fix, all footer links should work correctly on both case-sensitive and case-insensitive file systems.