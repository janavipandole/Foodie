// ===== Global Variables & Initialization =====
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";

// Robust Google Initialization
window.onGoogleLibraryLoad = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
  });

  const loginBtn = document.getElementById("loginGoogleBtn");
  if (loginBtn) {
    google.accounts.id.renderButton(loginBtn, { 
      theme: currentTheme === 'dark' ? "filled_black" : "outline", 
      size: "large", 
      width: "100%", 
      text: "signin_with",
      shape: "pill"
    });
  }

  const signupBtn = document.getElementById("signupGoogleBtn");
  if (signupBtn) {
    google.accounts.id.renderButton(signupBtn, { 
      theme: currentTheme === 'dark' ? "filled_black" : "outline", 
      size: "large", 
      width: "100%", 
      text: "signup_with",
      shape: "pill"
    });
  }
};

// Theme & UI Setup
document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') html.setAttribute('data-theme', 'dark');
  updateThemeIcon(theme);

  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      html.classList.add('theme-transition');
      if (next === 'dark') html.setAttribute('data-theme', 'dark');
      else html.removeAttribute('data-theme');
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
      
      // Re-render Google buttons with new theme
      if (typeof google !== 'undefined' && google.accounts) {
        window.onGoogleLibraryLoad();
      }
      
      setTimeout(() => html.classList.remove('theme-transition'), 600);
    });
  }
  
  // Fallback if Google loaded before DOM
  if (typeof google !== 'undefined' && google.accounts) {
    window.onGoogleLibraryLoad();
  }

  // Handle demo mode from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') {
    toggleDemoMode(true);
  }
});

// ===== Helper Functions =====
function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const icon = btn.querySelector('i');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const btn = input.nextElementSibling;
  const icon = btn ? btn.querySelector('i') : null;
  
  if (input.type === "password") {
    input.type = "text";
    if (icon) icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = "password";
    if (icon) icon.className = 'fa-solid fa-eye';
  }
}
window.togglePassword = togglePassword;

function switchForm(formType) {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const heroEmoji = document.getElementById("heroEmoji");
  const heroTagline = document.getElementById("heroTagline");

  if (formType === "signup") {
    if (loginForm) loginForm.classList.remove("active");
    if (signupForm) signupForm.classList.add("active");
    if (heroEmoji) heroEmoji.innerHTML = '<img src="../imgs/pancakes.webp" alt="Food" style="width: 150px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));">';
    if (heroTagline) heroTagline.textContent = t('auth.signupTagline', 'Join Foodie today!');
  } else {
    if (signupForm) signupForm.classList.remove("active");
    if (loginForm) loginForm.classList.add("active");
    if (heroEmoji) heroEmoji.innerHTML = '<img src="../imgs/pizza.webp" alt="Food" style="width: 150px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));">';
    if (heroTagline) heroTagline.textContent = t('auth.loginTagline', 'Your favorite meals are just a click away.');
  }
}
window.switchForm = switchForm;

// ===== Cryptographic Helper Utilities =====
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  if (window.crypto && window.crypto.subtle) {
    const buffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash method if subtle crypto is unavailable
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

function generateSalt() {
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ===== LocalStorage Auth Implementation =====
async function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;

  const users = JSON.parse(localStorage.getItem('foodie_users') || '[]');
  if (users.find(u => u.email === email || u.phone === phone)) {
    showToast(t('auth.userExists', 'User with this email or phone already exists!'), "error");
    return;
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  users.push({ name, email, phone, passwordHash, salt });
  localStorage.setItem('foodie_users', JSON.stringify(users));
  showToast(t('auth.registrationSuccess', 'Registration successful! Please login.'), "success");
  switchForm('login');
}
window.handleSignup = handleSignup;

function toggleDemoMode(state) {
  const checkbox = document.getElementById('demoToggle');
  const regularFields = document.getElementById('regularLoginFields');
  const demoFields = document.getElementById('demoLoginFields');
  const passwordGroup = document.getElementById('passwordGroup');
  const loginBtn = document.getElementById('loginBtn');

  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const demoName = document.getElementById('demoName');

  // Ensure we are in login form
  switchForm('login');

  const isDemo = typeof state === 'boolean' ? state : state.checked;
  if (checkbox) checkbox.checked = isDemo;

  if (isDemo) {
    regularFields.style.display = 'none';
    demoFields.style.display = 'block';
    passwordGroup.style.display = 'none';
    loginBtn.textContent = t('auth.guestLogin', 'Enter as Guest');
    
    // Remove required from hidden fields to prevent form submission errors
    if (loginEmail) loginEmail.removeAttribute('required');
    if (loginPassword) loginPassword.removeAttribute('required');
    if (demoName) demoName.setAttribute('required', 'required');
  } else {
    regularFields.style.display = 'block';
    demoFields.style.display = 'none';
    passwordGroup.style.display = 'block';
    loginBtn.textContent = t('auth.signInButton', 'Sign In');
    
    // Restore required attributes
    if (loginEmail) loginEmail.setAttribute('required', 'required');
    if (loginPassword) loginPassword.setAttribute('required', 'required');
    if (demoName) demoName.removeAttribute('required');
  }
}
window.toggleDemoMode = toggleDemoMode;

async function handleLogin(event) {
  event.preventDefault();
  const demoFields = document.getElementById('demoLoginFields');
  const isDemo = demoFields && (demoFields.style.display === 'block' || window.getComputedStyle(demoFields).display === 'block');

  if (isDemo) {
    const demoName = document.getElementById('demoName').value || 'Guest User';
    const gender = document.getElementById('demoGender').value;
    
    let defaultAvatar = '../imgs/user-avatar.png'; // Fallback
    if (gender === 'male') defaultAvatar = '../imgs/profile1.webp';
    if (gender === 'female') defaultAvatar = '../imgs/profile3.webp';

    loginUser({ 
      name: demoName, 
      email: 'demo@foodie.com', 
      phone: '0000000000',
      picture: defaultAvatar 
    });
    return;
  }

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const users = JSON.parse(localStorage.getItem('foodie_users') || '[]');
  const user = users.find(u => u.email === email);

  if (user) {
    let isValid = false;
    if (user.passwordHash && user.salt) {
      const computedHash = await hashPassword(password, user.salt);
      isValid = (computedHash === user.passwordHash);
    } else if (user.password) {
      // Legacy backwards compatibility check (migrates user)
      isValid = (user.password === password);
      if (isValid) {
        user.salt = generateSalt();
        user.passwordHash = await hashPassword(password, user.salt);
        delete user.password;
        localStorage.setItem('foodie_users', JSON.stringify(users));
      }
    }

    if (isValid) {
      loginUser(user);
      return;
    }
  }

  showToast(t('auth.invalidCredentials', 'Invalid email or password!'), "error");
}
window.handleLogin = handleLogin;

function loginUser(user) {
  const sessionExp = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  localStorage.setItem('loggedInUser', JSON.stringify({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    picture: user.picture || '../imgs/profile1.webp',
    exp: sessionExp
  }));
  showToast(t('auth.welcomeBack', 'Welcome back, {name}!').replace('{name}', user.name), "success");
  setTimeout(() => {
    window.location.href = './index.html';
  }, 1000);
}

// ===== Google Auth Implementation =====
function handleGoogleResponse(response) {
  try {
    const userData = decodeJwtResponse(response.credential);
    loginUser({ name: userData.name, email: userData.email, picture: userData.picture });
  } catch (error) {
    showToast(t('auth.googleLoginFailed', 'Google Login failed. Please use regular login.'), "error");
  }
}

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

// Removed legacy loginWithPhone

// ===== Toast Notification Helper =====
function showToast(message, type = "info") {
  const toast = document.createElement('div');
  toast.className = `auth-toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const toastStyle = document.createElement('style');
toastStyle.textContent = `
  .auth-toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    transform: translateY(100px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
  }
  .auth-toast.show { transform: translateY(0); }
  .auth-toast.success { border-left: 4px solid #27ae60; }
  .auth-toast.error { border-left: 4px solid #e74c3c; }
  .auth-toast.info { border-left: 4px solid #3498db; }
  .auth-toast i { font-size: 1.2rem; }
  .auth-toast.success i { color: #27ae60; }
  .auth-toast.error i { color: #e74c3c; }
  .auth-toast.info i { color: #3498db; }
  [data-theme="dark"] .auth-toast { background: #333; color: white; }
`;
document.head.appendChild(toastStyle);