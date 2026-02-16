// XDrive Platform Authentication & Logic
// Static HTML limitation - basic access gate only
// WARNING: This is NOT real security - password is visible in source code
// This only blocks casual access. For production, implement proper server-side authentication.

const PLATFORM_PASSWORD = "XDRIVE2026!";

// DOM Elements
let loginScreen, dashboardContent, loginForm, emailInput, passwordInput, errorMessage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  loginScreen = document.getElementById('login-screen');
  dashboardContent = document.getElementById('dashboard-content');
  loginForm = document.getElementById('login-form');
  emailInput = document.getElementById('email');
  passwordInput = document.getElementById('password');
  errorMessage = document.getElementById('error-message');
  
  // Check authentication status on page load
  checkAuth();
  
  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

// Check if user is authenticated
function checkAuth() {
  if (localStorage.getItem("xdrive_auth") === "1") {
    showDashboard();
  } else {
    showLoginScreen();
  }
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Basic validation
  if (!email) {
    showError("Please enter an email address");
    return;
  }
  
  if (!password) {
    showError("Please enter a password");
    return;
  }
  
  // Check password
  if (password === PLATFORM_PASSWORD) {
    // Success - set auth token
    localStorage.setItem("xdrive_auth", "1");
    hideError();
    showDashboard();
  } else {
    // Failed
    showError("Invalid password. Please try again.");
    passwordInput.value = '';
    passwordInput.focus();
  }
}

// Handle logout
function handleLogout(e) {
  e.preventDefault();
  localStorage.removeItem("xdrive_auth");
  window.location.reload();
}

// Show login screen
function showLoginScreen() {
  if (loginScreen && dashboardContent) {
    loginScreen.classList.remove('dashboard-content');
    loginScreen.style.display = 'flex';
    dashboardContent.style.display = 'none';
    dashboardContent.classList.remove('show');
  }
}

// Show dashboard
function showDashboard() {
  if (loginScreen && dashboardContent) {
    loginScreen.style.display = 'none';
    dashboardContent.style.display = 'block';
    dashboardContent.classList.add('show');
  }
}

// Show error message
function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
  }
}

// Hide error message
function hideError() {
  if (errorMessage) {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
  }
}
