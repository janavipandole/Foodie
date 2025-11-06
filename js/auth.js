// ===== Password Toggle =====
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
}
window.togglePassword = togglePassword;

// ===== Switch Login/Signup Forms =====
function switchForm(formType) {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (formType === "login") {
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
  } else if (formType === "signup") {
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
  }
}
window.switchForm = switchForm;

// ===== Theme Toggle =====
(() => {
  const themeToggleBtn = document.getElementById('themeToggle');

  const applySmoothTransition = () => {
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 600);
  };

  const updateThemeIcon = (theme) => {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('i');
    if (!icon) return;
    if (theme === 'dark') {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
    icon.classList.add('rotate-icon');
    setTimeout(() => icon.classList.remove('rotate-icon'), 600);
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applySmoothTransition();
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  };

  const initTheme = () => {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  };

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  initTheme();
})();

// ===== Dummy Handlers =====
function handleLogin(event) {
  event.preventDefault();
  alert("Regular login coming soon!");
}

function handleSignup(event) {
  event.preventDefault();
  alert("Regular signup coming soon!");
}

// ===== GOOGLE SIGN-IN INTEGRATION =====

// ⚠️ Replace this with your real Google OAuth Client ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";

// Initialize Google Sign-In
window.onload = function () {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
  });

  // Render Google buttons for login and signup
  google.accounts.id.renderButton(
    document.getElementById("loginGoogleBtn"),
    { theme: "outline", size: "large", text: "signin_with" }
  );
  google.accounts.id.renderButton(
    document.getElementById("signupGoogleBtn"),
    { theme: "outline", size: "large", text: "signup_with" }
  );
};

// Handle Google login response
function handleGoogleResponse(response) {
  const userData = decodeJwtResponse(response.credential);

  console.log("Google User:", userData);

  // Example: Display welcome message
  alert(`Welcome, ${userData.name} (${userData.email})`);

  // Here you can send userData to your backend via fetch()
  // to create or login the user in your system.
}

// Decode Google JWT token
function decodeJwtResponse(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}


// ===== PHONE NUMBER LOGIN =====
function loginWithPhone() {
  // Simple prompt for phone number
  const phoneNumber = prompt("Enter your phone number (e.g. +91 123456789):");
  if (!phoneNumber) return; // user cancelled

  // Set up invisible reCAPTCHA (required by Firebase)
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  const appVerifier = window.recaptchaVerifier;

  // Send OTP
  firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
      const code = prompt("Enter the OTP sent to your phone:");
      return confirmationResult.confirm(code);
    })
    .then((result) => {
      alert("✅ Phone number verified successfully!");
      console.log("User:", result.user);
    })
    .catch((error) => {
      alert("❌ Error: " + error.message);
      console.error(error);
    });
}

// Make function global so onclick can access it
window.loginWithPhone = loginWithPhone;