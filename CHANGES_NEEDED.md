# Changes Needed to Fix Issue #318

## Files to Update

### html/index.html
Replace all instances in footer section (lines 311-327):
- `../HTML/index.html` → `../html/index.html` (3 occurrences)
- `../HTML/PartnerWithUs.html` → `../html/PartnerWithUs.html`
- `../HTML/aboutUs.html` → `../html/aboutUs.html`
- `../HTML/contactUs.html` → `../html/contactUs.html` (2 occurrences)
- `../HTML/signup.html` → `../html/signup.html`
- `../HTML/supportCenter.html` → `../html/supportCenter.html`
- `../HTML/feedback.html` → `../html/feedback.html`

### html/aboutUs.html
Replace all instances in footer section:
- `../HTML/signup.html` → `../html/signup.html`
- `../HTML/supportCenter.html` → `../html/supportCenter.html`
- `../HTML/feedback.html` → `../html/feedback.html`
- `../HTML/contactUs.html` → `../html/contactUs.html`

Also in CTA section (line ~298):
- `../HTML/signup.html` → `../html/signup.html`

### html/contactUs.html
Replace all instances in footer section:
- `../HTML/signup.html` → `../html/signup.html`
- `../HTML/supportCenter.html` → `../html/supportCenter.html`
- `../HTML/feedback.html` → `../html/feedback.html`
- `../HTML/contactUs.html` → `../html/contactUs.html`

### Other HTML files
Check and fix similar patterns in:
- html/PartnerWithUs.html
- html/checkout.html
- html/nearbyres.html
- html/signup.html
- html/supportCenter.html
- html/feedback.html

## Quick Fix Command
For developers with access, you can use find and replace:
```bash
find html/ -name "*.html" -type f -exec sed -i 's|../HTML/|../html/|g' {} +
```

This will replace all instances of `../HTML/` with `../html/` in all HTML files.