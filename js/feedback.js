// Feedback interactivity script with enhanced error handling and user feedback
// Handles opening/closing the feedback form and submitting feedback with proper error handling

document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.feedback-card');
    const modal = document.getElementById('feedback-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('feedback-form');
    const overlay = document.getElementById('modal-overlay');
    const toast = document.getElementById('success-toast');

    // Import error handling utilities
    const {
        retry,
        NetworkError,
        showErrorToast,
        showSuccessToast,
        errorLogger
    } = window.FoodieErrorHandler || {};

    // ===== LOADING STATE MANAGEMENT =====
    function setLoadingState(element, isLoading, message = 'Submitting...') {
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
    function validateForm(formData) {
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
    async function submitFeedback(formData) {
        const endpoint = form.getAttribute("action")?.trim() || "/api/feedback";

        return await retry(async () => {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({
                    ...formData,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            });

            if (!response.ok) {
                throw new NetworkError(`Feedback submission failed: HTTP ${response.status}`);
            }

            return await response.json();
        }, 2, 1000); // 2 retries with 1s delay
    }

    // ===== EVENT HANDLERS =====
    cards.forEach(card => {
        card.addEventListener('click', function () {
            const category = card.querySelector('h2').textContent;
            modalTitle.textContent = category;
            modalCategory.value = category;
            modal.classList.add('open');
            overlay.classList.add('open');
            form.reset();
            // Clear any previous errors
            form.querySelectorAll('.field-error').forEach(el => el.remove());
            form.querySelectorAll('[aria-invalid="true"]').forEach(el => {
                el.removeAttribute('aria-invalid');
                el.setCustomValidity('');
            });
            form.querySelector('textarea').focus();
        });

        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    function closeModal() {
        modal.classList.remove('open');
        overlay.classList.remove('open');
    }

    // ===== FORM SUBMISSION =====
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('[aria-invalid="true"]').forEach(el => {
            el.removeAttribute('aria-invalid');
            el.setCustomValidity('');
        });

        // Collect form data
        const formData = {
            name: form.querySelector('[name="name"]')?.value?.trim(),
            email: form.querySelector('[name="email"]')?.value?.trim(),
            rating: form.querySelector('[name="rating"]:checked')?.value,
            feedback: form.querySelector('[name="feedback"]')?.value?.trim(),
            category: modalCategory.value
        };

        // Validate form
        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => {
                showErrorToast(error);
            });
            return;
        }

        // Show loading state
        setLoadingState(form, true, 'Submitting feedback...');

        try {
            // Submit feedback
            await submitFeedback(formData);

            // Success
            setLoadingState(form, false);
            showSuccessToast('Thank you for your feedback! We appreciate your input.');
            closeModal();

        } catch (error) {
            setLoadingState(form, false);

            // Log the error
            errorLogger.log(error, {
                operation: 'submitFeedback',
                category: formData.category,
                formData: { ...formData, feedback: formData.feedback.substring(0, 100) + '...' } // Truncate for logging
            });

            // Show user-friendly error message
            showErrorToast('Failed to submit feedback. Please try again or contact support.');

            // Add retry button to form
            const submitBtn = form.querySelector('.submit-btn');
            if (submitBtn && !form.querySelector('.retry-btn')) {
                const retryBtn = document.createElement('button');
                retryBtn.type = 'button';
                retryBtn.className = 'retry-btn';
                retryBtn.textContent = 'Retry Submission';
                retryBtn.onclick = () => {
                    retryBtn.remove();
                    form.dispatchEvent(new Event('submit'));
                };
                submitBtn.insertAdjacentElement('afterend', retryBtn);
            }
        }
    });

    // ===== TOAST FUNCTION =====
    function showToast() {
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2200);
        }
    }
});
