/**
 * Feedback interactivity script with enhanced error handling and user feedback
 * Handles opening/closing the feedback form and submitting feedback with proper error handling
 */

// Import error handling utilities
const errorHandler = typeof window !== 'undefined' ? window.FoodieErrorHandler : {};
const {
    retry = async (fn) => fn(),
    NetworkError = Error,
    showErrorToast = console.error,
    showSuccessToast = console.log,
    errorLogger = { log: console.error }
} = errorHandler || {};

// ===== LOADING STATE MANAGEMENT =====
export function setLoadingState(element, isLoading, message = 'Submitting...') {
    if (!element) return;

    const existingLoader = element.querySelector('.loading-overlay');
    if (isLoading) {
        if (!existingLoader) {
            const loader = document.createElement('div');
            loader.className = 'loading-overlay';
            loader.innerHTML = `
                <div class="loading-spinner"></div>
                <span class="loading-text">${message}</span>
            `;
            element.style.position = 'relative';
            element.appendChild(loader);
        }
        element.classList.add('loading');
    } else {
        if (existingLoader) {
            existingLoader.remove();
        }
        element.classList.remove('loading');
    }
}

// ===== FORM VALIDATION =====
export function validateForm(formData) {
    const errors = [];

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
        errors.push('Please enter a valid email address');
    }

    // Rating validation
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
        errors.push('Please select a rating between 1 and 5 stars');
    }

    // Feedback validation
    if (!formData.feedback || formData.feedback.trim().length < 10) {
        errors.push('Please provide feedback with at least 10 characters');
    }

    return errors;
}

// ===== FEEDBACK SUBMISSION =====
export async function submitFeedback(formData, formElement) {
    const endpoint = formElement?.getAttribute("action")?.trim() || "/api/feedback";

    return await retry(async () => {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
                ...formData,
                timestamp: new Date().toISOString(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                url: typeof window !== 'undefined' ? window.location.href : ''
            })
        });

        if (!response.ok) {
            throw new NetworkError(`Feedback submission failed: HTTP ${response.status}`);
        }

        return await response.json();
    }, 2, 1000); // 2 retries with 1s delay
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        const cards = document.querySelectorAll('.feedback-card');
        const modal = document.getElementById('feedback-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalCategory = document.getElementById('modal-category');
        const closeBtn = document.getElementById('close-modal');
        const form = document.getElementById('feedback-form');
        const overlay = document.getElementById('modal-overlay');
        const toast = document.getElementById('success-toast');

        function closeModal() {
            if (modal) modal.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
        }

        cards.forEach(card => {
            card.addEventListener('click', function () {
                const category = card.querySelector('h2')?.textContent || '';
                if (modalTitle) modalTitle.textContent = category;
                if (modalCategory) modalCategory.value = category;
                if (modal) modal.classList.add('open');
                if (overlay) overlay.classList.add('open');
                if (form) {
                    form.reset();
                    form.querySelectorAll('.field-error').forEach(el => el.remove());
                    form.querySelectorAll('[aria-invalid="true"]').forEach(el => {
                        el.removeAttribute('aria-invalid');
                        el.setCustomValidity('');
                    });
                    form.querySelector('textarea')?.focus();
                }
            });

            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });

        if (form) {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();

                form.querySelectorAll('.field-error').forEach(el => el.remove());
                form.querySelectorAll('[aria-invalid="true"]').forEach(el => {
                    el.removeAttribute('aria-invalid');
                    el.setCustomValidity('');
                });

                const formData = {
                    name: form.querySelector('[name="name"]')?.value?.trim(),
                    email: form.querySelector('[name="email"]')?.value?.trim(),
                    rating: form.querySelector('[name="rating"]:checked')?.value,
                    feedback: form.querySelector('[name="feedback"]')?.value?.trim(),
                    category: modalCategory?.value || ''
                };

                const validationErrors = validateForm(formData);
                if (validationErrors.length > 0) {
                    validationErrors.forEach(error => {
                        showErrorToast(error);
                    });
                    return;
                }

                const submittingText = typeof t === 'function' ? t('feedback.submitting', 'Submitting feedback...') : 'Submitting feedback...';
                setLoadingState(form, true, submittingText);

                try {
                    await submitFeedback(formData, form);

                    setLoadingState(form, false);
                    const successText = typeof t === 'function' ? t('feedback.success', 'Thank you for your feedback! We appreciate your input.') : 'Thank you for your feedback! We appreciate your input.';
                    showSuccessToast(successText);
                    closeModal();

                } catch (error) {
                    setLoadingState(form, false);

                    errorLogger.log(error, {
                        operation: 'submitFeedback',
                        category: formData.category,
                        formData: { ...formData, feedback: formData.feedback ? formData.feedback.substring(0, 100) + '...' : '' }
                    });

                    const failedText = typeof t === 'function' ? t('feedback.submitFailed', 'Failed to submit feedback. Please try again or contact support.') : 'Failed to submit feedback. Please try again or contact support.';
                    showErrorToast(failedText);

                    const submitBtn = form.querySelector('.submit-btn');
                    if (submitBtn && !form.querySelector('.retry-btn')) {
                        const retryBtn = document.createElement('button');
                        retryBtn.type = 'button';
                        retryBtn.className = 'retry-btn';
                        retryBtn.textContent = typeof t === 'function' ? t('feedback.retryButton', 'Retry Submission') : 'Retry Submission';
                        retryBtn.onclick = () => {
                            retryBtn.remove();
                            form.dispatchEvent(new Event('submit'));
                        };
                        submitBtn.insertAdjacentElement('afterend', retryBtn);
                    }
                }
            });
        }
    });
}

// Global window bindings for backward compatibility
if (typeof window !== 'undefined') {
    window.feedbackModule = {
        validateForm,
        submitFeedback,
        setLoadingState
    };
}
