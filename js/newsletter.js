/**
 * Newsletter Module
 * Manages newsletter subscription email validation and form submission handling.
 */

/**
 * Validates an email address format using a strict regex pattern.
 * @param {string} email - Email address string to validate
 * @returns {boolean} True if valid email format, false otherwise
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
}

/**
 * Handles the newsletter subscription form submission and inline error states.
 * @param {Event} e - Form submit event
 */
export function handleNewsletterSubmit(e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    if (typeof document === 'undefined') return;

    const newsletterForm = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('email');
    const errorMessage = document.getElementById('emailError');

    if (!emailInput) return;

    const email = emailInput.value.trim();

    const showError = (message) => {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        emailInput.classList.add('error');
    };

    const hideError = () => {
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        emailInput.classList.remove('error');
    };

    // Check if empty
    if (!email) {
        showError('Email address is required');
        emailInput.focus();
        return;
    }

    // Check if valid format
    if (!validateEmail(email)) {
        showError('Please enter a valid email address (e.g., user@example.com)');
        emailInput.focus();
        return;
    }

    // Success - hide error and show confirmation
    hideError();
    const successMsg = typeof t === 'function' 
        ? t('newsletter.success', 'Thank you for subscribing!\nYou will receive updates at: {email}').replace('{email}', email)
        : `Thank you for subscribing!\nYou will receive updates at: ${email}`;
    
    alert(successMsg);
    emailInput.value = '';
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const newsletterForm = document.getElementById('newsletterForm');
        const emailInput = document.getElementById('email');
        const errorMessage = document.getElementById('emailError');

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }

        if (emailInput) {
            const showError = (message) => {
                if (errorMessage) {
                    errorMessage.textContent = message;
                    errorMessage.style.display = 'block';
                }
                emailInput.classList.add('error');
            };

            const hideError = () => {
                if (errorMessage) {
                    errorMessage.style.display = 'none';
                }
                emailInput.classList.remove('error');
            };

            emailInput.addEventListener('input', () => {
                const email = emailInput.value.trim();
                if (email.length > 0 && !validateEmail(email)) {
                    showError('Please enter a valid email address (e.g., user@example.com)');
                } else {
                    hideError();
                }
            });

            emailInput.addEventListener('focus', () => {
                hideError();
            });
        }
    });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.validateEmail = validateEmail;
    window.handleNewsletterSubmit = handleNewsletterSubmit;
    window.newsletterModule = {
        validateEmail,
        handleNewsletterSubmit
    };
}
