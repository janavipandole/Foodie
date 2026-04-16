document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('email');
    const errorMessage = document.getElementById('emailError');

    // Strict email validation pattern
    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        emailInput.classList.add('error');
    }

    // Hide error message
    function hideError() {
        errorMessage.style.display = 'none';
        emailInput.classList.remove('error');
    }

    // Real-time validation while typing
    emailInput.addEventListener('input', function() {
        const email = emailInput.value.trim();
        
        if (email.length > 0 && !validateEmail(email)) {
            showError('Please enter a valid email address (e.g., user@example.com)');
        } else {
            hideError();
        }
    });

    // Clear error on focus
    emailInput.addEventListener('focus', function() {
        hideError();
    });

    // Form submission validation
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();

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
        alert('Thank you for subscribing!\nYou will receive updates at: ' + email);
        emailInput.value = '';
        
        // TODO: Add your backend API call here
        // Example: fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
    });
});