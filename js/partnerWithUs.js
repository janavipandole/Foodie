/**
 * Partner With Us Module
 * Handles form validation, whitespace trimming, inline error rendering, backend API requests, and success toasts.
 */

export const requiredFields = [
    "restaurantName",
    "ownerName",
    "email",
    "phone",
    "city",
    "cuisine"
];

/**
 * Removes old inline error messages and resets custom validity states.
 * @param {HTMLFormElement} form - Partner form element
 */
export function clearErrors(form) {
    if (!form || typeof document === 'undefined') return;
    form.querySelectorAll(".field-error").forEach(el => el.remove());
    form.querySelectorAll("[aria-invalid='true']").forEach(el => {
        el.removeAttribute("aria-invalid");
        if (typeof el.setCustomValidity === 'function') {
            el.setCustomValidity("");
        }
    });
}

/**
 * Displays an error message under a form field.
 * @param {HTMLElement} field - Form input or textarea element
 * @param {string} message - Error message text
 */
export function showFieldError(field, message) {
    if (!field || typeof document === 'undefined') return;
    field.setAttribute("aria-invalid", "true");
    if (typeof field.setCustomValidity === 'function') {
        field.setCustomValidity(message);
    }

    const error = document.createElement("div");
    error.className = "field-error";
    error.style.color = "red";
    error.style.fontSize = "13px";
    error.style.marginTop = "4px";
    error.textContent = message;

    field.insertAdjacentElement("afterend", error);
}

/**
 * Collects and trims form data values.
 * @param {HTMLFormElement} form - Partner form element
 * @returns {Object} Trimmed key-value pairs of form fields
 */
export function getTrimmedData(form) {
    if (!form) return {};
    const data = {};
    new FormData(form).forEach((value, key) => {
        data[key] = typeof value === 'string' ? value.trim() : value;
    });
    return data;
}

/**
 * Validates required form fields.
 * @param {Object} data - Collected form data object
 * @param {HTMLFormElement} form - Partner form element
 * @returns {boolean} True if valid, false otherwise
 */
export function validateForm(data, form) {
    if (!form) return false;
    let valid = true;

    requiredFields.forEach(name => {
        const field = form.querySelector(`[name="${name}"]`);
        const value = data[name];

        if (!field) return;

        if (!value || String(value).length === 0) {
            showFieldError(field, "This field is required");
            valid = false;
        }
    });

    return valid;
}

/**
 * Displays the success toast notification.
 * @param {HTMLElement} toast - Toast element
 */
export function showToast(toast) {
    if (!toast || typeof document === 'undefined') return;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

/**
 * Manages loading states on elements.
 * @param {HTMLElement} element - Target element
 * @param {boolean} isLoading - Loading status flag
 * @param {string} message - Loading message text
 */
export function setLoadingState(element, isLoading, message = 'Submitting...') {
    if (!element || typeof document === 'undefined') return;

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

/**
 * Sends a backend API request with error handling and retries.
 * @param {Object} payload - Data payload
 * @param {HTMLFormElement} form - Partner form element
 * @returns {Promise<Response>} Fetch response
 */
export async function sendRealRequest(payload, form) {
    const endpoint = form?.getAttribute("action")?.trim() || "/api/partners";

    const errorHandler = typeof window !== 'undefined' ? window.FoodieErrorHandler : {};
    const {
        retry = async (fn) => fn(),
        NetworkError = Error
    } = errorHandler || {};

    return await retry(async () => {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new NetworkError(`Submission failed: HTTP ${response.status}`);
        }

        return response;
    }, 2, 1000);
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector(".partner-form");
        const toast = document.getElementById("partner-success-toast");

        if (!form || !toast) return;

        // Disable native HTML5 tooltips
        form.noValidate = true;

        // Form submit
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            clearErrors(form);

            const data = getTrimmedData(form);

            // Validate
            if (!validateForm(data, form)) return;

            // Show loading state
            setLoadingState(form, true, 'Submitting partnership request...');

            try {
                // Real backend request with retry
                await sendRealRequest(data, form);

                setLoadingState(form, false);
                form.reset();
                showToast(toast);

            } catch (error) {
                setLoadingState(form, false);

                const errorHandler = typeof window !== 'undefined' ? window.FoodieErrorHandler : {};
                const { errorLogger = { log: console.error }, showErrorToast = console.error } = errorHandler;

                // Log the error
                if (errorLogger.log) {
                    errorLogger.log(error, { operation: 'partnerSubmission', data });
                }

                console.warn("Server rejected submission:", error.message);

                // Show user-friendly error message
                const emailField = form.querySelector("[name='email']");
                const fieldFailMsg = typeof t === 'function' 
                    ? t('partner.submitFailedField', 'Submission failed. Please check your connection and try again.')
                    : 'Submission failed. Please check your connection and try again.';
                
                if (emailField) {
                    showFieldError(emailField, fieldFailMsg);
                }

                // Show toast notification
                const toastFailMsg = typeof t === 'function'
                    ? t('partner.submitFailedToast', 'Failed to submit partnership request. Please try again.')
                    : 'Failed to submit partnership request. Please try again.';
                
                showErrorToast(toastFailMsg);
            }
        });

        // Fix invisible caret issue (focus on click)
        form.querySelectorAll("input, textarea").forEach(el => {
            el.addEventListener("mousedown", ev => {
                ev.preventDefault();
                el.focus();
                try {
                    const len = el.value.length;
                    el.setSelectionRange(len, len);
                } catch (e) {}
            });
        });
    });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.validateForm = validateForm;
    window.getTrimmedData = getTrimmedData;
    window.clearErrors = clearErrors;
    window.showFieldError = showFieldError;
    window.showToast = showToast;
    window.setLoadingState = setLoadingState;
    window.sendRealRequest = sendRealRequest;
    window.partnerWithUsModule = {
        requiredFields,
        validateForm,
        getTrimmedData,
        clearErrors,
        showFieldError,
        showToast,
        setLoadingState,
        sendRealRequest
    };
}
