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
    document.getElementById('emailForm').classList.remove('active');
    document.getElementById('successMessage').classList.add('active');
    document.getElementById('sentEmail').textContent = email;

    // Save email for resend
    localStorage.setItem('resetEmail', email);
  }

  /* =========================
     RESEND EMAIL
  ========================== */

  function resendEmail() {
    const email = localStorage.getItem('resetEmail');
    if (email) {
      alert(`Reset link resent to ${email}`);
    }
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
  window.resendEmail = resendEmail;
  window.switchToEmailForm = switchToEmailForm;
});
