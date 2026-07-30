/**
 * Forgot Password Module
 * Handles password reset requests, resend timers, and theme initialization.
 */

/**
 * Updates the theme toggle icon and accessibility attributes.
 * @param {HTMLElement} themeToggle - Theme toggle button element
 * @param {HTMLElement} themeIcon - Icon element inside the toggle button
 * @param {string} theme - 'dark' or 'light'
 */
export function updateThemeIcon(themeToggle, themeIcon, theme) {
  if (!themeToggle || !themeIcon) return;
  if (theme === 'dark') {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }
  themeToggle.setAttribute('aria-pressed', theme === 'dark');
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

/**
 * Sends a password reset email request.
 * @param {string} email - Recipient email address
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function sendResetEmail(email) {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Request failed');
    return true;
  } catch (err) {
    console.error('Failed to send reset email:', err);
    const errorMsg = typeof t === 'function' 
      ? t('forgotPassword.requestFailed', 'Something went wrong. Please try again.') 
      : 'Something went wrong. Please try again.';
    alert(errorMsg);
    return false;
  }
}

/**
 * Sets up the resend email timer and click handler.
 * @param {string} email - Recipient email address
 */
export function setupResendButton(email) {
  const btn = document.getElementById('resendBtn');
  if (!btn) return;

  const fresh = btn.cloneNode(true);
  btn.parentNode.replaceChild(fresh, btn);

  fresh.addEventListener('click', async () => {
    fresh.disabled = true;

    const success = await sendResetEmail(email);
    if (success) {
      let seconds = 30;
      fresh.textContent = `Resend in ${seconds}s`;

      const interval = setInterval(() => {
        seconds--;
        fresh.textContent = `Resend in ${seconds}s`;

        if (seconds <= 0) {
          clearInterval(interval);
          fresh.disabled = false;
          fresh.textContent = 'Resend email';
        }
      }, 1000);
    } else {
      fresh.disabled = false;
    }
  });
}

/**
 * Handles the forgot password form submission.
 * @param {Event} event - Submit event
 */
export async function handleForgotPassword(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const emailInput = document.getElementById('resetEmail');
  if (!emailInput) return;

  const email = emailInput.value.trim();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const invalidMsg = typeof t === 'function' 
      ? t('forgotPassword.invalidEmail', 'Please enter a valid email address') 
      : 'Please enter a valid email address';
    alert(invalidMsg);
    emailInput.focus();
    return;
  }

  const success = await sendResetEmail(email);
  if (success) {
    document.getElementById('emailForm')?.classList.remove('active');
    document.getElementById('successMessage')?.classList.add('active');
    const sentEmailEl = document.getElementById('sentEmail');
    if (sentEmailEl) sentEmailEl.textContent = email;

    setupResendButton(email);
  }
}

/**
 * Switches the view back to the email input form.
 */
export function switchToEmailForm() {
  document.getElementById('successMessage')?.classList.remove('active');
  document.getElementById('emailForm')?.classList.add('active');
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Initialization
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const html = document.documentElement;
      const themeIcon = themeToggle.querySelector('i');
      
      if (themeIcon) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

        html.setAttribute('data-theme', currentTheme);
        updateThemeIcon(themeToggle, themeIcon, currentTheme);

        let rotateTimeout = null;
        themeToggle.addEventListener('click', () => {
          if (rotateTimeout) {
            clearTimeout(rotateTimeout);
            rotateTimeout = null;
            themeIcon.classList.remove('rotate-icon');
            html.classList.remove('theme-transition');
          }
          html.classList.add('theme-transition');

          const activeTheme = html.getAttribute('data-theme');
          const newTheme = activeTheme === 'light' ? 'dark' : 'light';

          html.setAttribute('data-theme', newTheme);
          try {
            localStorage.setItem('theme', newTheme);
          } catch (err) {
            console.warn('[themeToggle] Could not persist theme:', err);
          }
          updateThemeIcon(themeToggle, themeIcon, newTheme);

          themeIcon.classList.add('rotate-icon');

          rotateTimeout = setTimeout(() => {
            html.classList.remove('theme-transition');
            themeIcon.classList.remove('rotate-icon');
            rotateTimeout = null;
          }, 600);
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            updateThemeIcon(themeToggle, themeIcon, newTheme);
          }
        });
      }
    }

    // Auto focus email input
    document.getElementById('resetEmail')?.focus();

    // Attach form submit listeners if forms exist
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
      emailForm.addEventListener('submit', handleForgotPassword);
    }
  });
}

// Global window bindings for legacy script compatibility
if (typeof window !== 'undefined') {
  window.handleForgotPassword = handleForgotPassword;
  window.switchToEmailForm = switchToEmailForm;
  window.forgotPasswordModule = {
    handleForgotPassword,
    sendResetEmail,
    setupResendButton,
    switchToEmailForm,
    updateThemeIcon
  };
}
