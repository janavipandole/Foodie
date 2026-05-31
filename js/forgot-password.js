document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     THEME TOGGLE FUNCTIONALITY
  ========================== */

  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const themeIcon = themeToggle.querySelector('i');

  // Detect system theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Use saved theme or system theme
  const savedTheme = localStorage.getItem('theme');
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  html.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  // Theme toggle click
  themeToggle.addEventListener('click', () => {
    html.classList.add('theme-transition');

    const activeTheme = html.getAttribute('data-theme');
    const newTheme = activeTheme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    themeIcon.classList.add('rotate-icon');

    setTimeout(() => {
      html.classList.remove('theme-transition');
      themeIcon.classList.remove('rotate-icon');
    }, 600);
  });

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  }

  /* =========================
     FORGOT PASSWORD HANDLER
  ========================== */

  function handleForgotPassword(event) {
    event.preventDefault();

    const emailInput = document.getElementById('resetEmail');
    const email = emailInput.value.trim();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      emailInput.focus();
      return;
    }

    // Show success message
    sendResetEmail(email).then(success => {
      if (success) {
        document.getElementById('emailForm').classList.remove('active');
        document.getElementById('successMessage').classList.add('active');
        document.getElementById('sentEmail').textContent = email;

        setupResendButton(email); // email passed directly, no localStorage
        }
    });
  }

  /* =========================
     RESEND EMAIL
  ========================== */

  async function sendResetEmail(email) {
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
    alert('Something went wrong. Please try again.');
    return false;
  }
}
  function setupResendButton(email) {
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

  /* =========================
     SWITCH BACK TO FORM
  ========================== */

  function switchToEmailForm() {
    document.getElementById('successMessage').classList.remove('active');
    document.getElementById('emailForm').classList.add('active');
  }

  // Auto focus email input
  document.getElementById('resetEmail')?.focus();

  // Expose functions globally
  window.handleForgotPassword = handleForgotPassword;
  window.switchToEmailForm = switchToEmailForm;
});
