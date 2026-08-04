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
export function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const icon = btn.querySelector('i');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

export function togglePassword(inputId) {
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

export function switchForm(formType) {
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

// Hash password using SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== LocalStorage Auth Implementation =====
export async function handleSignup(event) {
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

  const hashedPassword = await hashPassword(password);
  users.push({ name, email, phone, password: hashedPassword });
  localStorage.setItem('foodie_users', JSON.stringify(users));
  showToast(t('auth.registrationSuccess', 'Registration successful! Please login.'), "success");
  switchForm('login');
}
window.handleSignup = handleSignup;

export function toggleDemoMode(state) {
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
    
    if (loginEmail) loginEmail.removeAttribute('required');
    if (loginPassword) loginPassword.removeAttribute('required');
    if (demoName) demoName.setAttribute('required', 'required');
  } else {
    regularFields.style.display = 'block';
    demoFields.style.display = 'none';
    passwordGroup.style.display = 'block';
    loginBtn.textContent = t('auth.signInButton', 'Sign In');
    
    if (loginEmail) loginEmail.setAttribute('required', 'required');
    if (loginPassword) loginPassword.setAttribute('required', 'required');
    if (demoName) demoName.removeAttribute('required');
  }
}
window.toggleDemoMode = toggleDemoMode;

export async function handleLogin(event) {
  event.preventDefault();
  const demoFields = document.getElementById('demoLoginFields');
  const isDemo = demoFields && (demoFields.style.display === 'block' || window.getComputedStyle(demoFields).display === 'block');

  if (isDemo) {
    const demoName = document.getElementById('demoName').value || 'Guest User';
    const gender = document.getElementById('demoGender').value;
    
    let defaultAvatar = '../imgs/user-avatar.png';
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
  const hashedPassword = await hashPassword(password);

  const users = JSON.parse(localStorage.getItem('foodie_users') || '[]');
  const user = users.find(u => u.email === email && (u.password === hashedPassword || u.password === password));

  if (user) {
    loginUser(user);
  } else {
    showToast(t('auth.invalidCredentials', 'Invalid email or password!'), "error");
  }
}
window.handleLogin = handleLogin;

export function loginUser(user) {
  localStorage.setItem('loggedInUser', JSON.stringify({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    picture: user.picture || '../imgs/profile1.webp'
  }));
  showToast(t('auth.welcomeBack', 'Welcome back, {name}!').replace('{name}', user.name), "success");
  setTimeout(() => {
    window.location.href = './index.html';
  }, 1000);
}

// ===== Google Auth Implementation =====
export function handleGoogleResponse(response) {
  try {
    const userData = decodeJwtResponse(response.credential);
    loginUser({ name: userData.name, email: userData.email, picture: userData.picture });
  } catch (error) {
    showToast(t('auth.googleLoginFailed', 'Google Login failed. Please use regular login.'), "error");
  }
}

export function decodeJwtResponse(token) {
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

// ===== Toast Notification Helper =====
export function showToast(message, type = "info") {
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
