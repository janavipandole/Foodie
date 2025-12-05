// Partner With Us – Complete Production Script
// Validation + Whitespace Trim + Inline Errors + Real Backend + Success Toast

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".partner-form");
    const toast = document.getElementById("partner-success-toast");

    if (!form || !toast) return;

    // Disable native HTML5 tooltips
    form.noValidate = true;

    // Required fields list
    const requiredFields = [
        "restaurantName",
        "ownerName",
        "email",
        "phone",
        "city",
        "cuisine"
    ];

    // Remove old inline error messages
    function clearErrors() {
        form.querySelectorAll(".field-error").forEach(el => el.remove());
        form.querySelectorAll("[aria-invalid='true']").forEach(el => {
            el.removeAttribute("aria-invalid");
            el.setCustomValidity("");
        });
    }

    // Show error under a field
    function showFieldError(field, message) {
        field.setAttribute("aria-invalid", "true");
        field.setCustomValidity(message);

        const error = document.createElement("div");
        error.className = "field-error";
        error.style.color = "red";
        error.style.fontSize = "13px";
        error.style.marginTop = "4px";
        error.textContent = message;

        field.insertAdjacentElement("afterend", error);
    }

    // Collect & trim form data
    function getTrimmedData() {
        const data = {};
        new FormData(form).forEach((value, key) => {
            data[key] = value.trim();
        });
        return data;
    }

    // Field validation
    function validateForm(data) {
        let valid = true;

        requiredFields.forEach(name => {
            const field = form.querySelector(`[name="${name}"]`);
            const value = data[name];

            if (!value || value.length === 0) {
                showFieldError(field, "This field is required");
                valid = false;
            }
        });

        return valid;
    }

    // Success toast
    function showToast() {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }

    // REAL backend API request
    async function sendRealRequest(payload) {
        const endpoint = form.getAttribute("action")?.trim() || "/api/partners";

        return fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(payload)
        });
    }

    // Form submit
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        clearErrors();

        const data = getTrimmedData();

        // Validate
        if (!validateForm(data)) return;

        // Real backend request
        const resp = await sendRealRequest(data);

        if (resp.ok) {
            form.reset();
            showToast();
        } else {
            console.warn("Server rejected submission:", resp.status);
            showFieldError(
                form.querySelector("[name='email']"),
                "Submission failed. Please try again."
            );
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
