// API Base URL matching the backend server
const API_BASE_URL = 'http://localhost:3100/api/auth';

// State management
let currentRole = 'user'; // 'user' (Student) or 'owner' (PG Owner)
let currentMode = 'login'; // 'login' or 'signup'

// DOM Elements
const authForm = document.getElementById('authForm');
const tabUser = document.getElementById('tabUser');
const tabOwner = document.getElementById('tabOwner');
const nameFieldGroup = document.getElementById('nameFieldGroup');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const btnSubmit = document.getElementById('btnSubmit');
const footerText = document.getElementById('footerText');
const toggleActionLink = document.getElementById('toggleActionLink');
const authAlert = document.getElementById('authAlert');

// Helper: Show alert message
function showAlert(message, type = 'error') {
    authAlert.textContent = message;
    authAlert.className = `auth-alert ${type}`;
    authAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Helper: Hide alert
function hideAlert() {
    authAlert.className = 'auth-alert hidden';
    authAlert.textContent = '';
}

// Update UI based on current State
function updateUI() {
    hideAlert();
    
    // 1. Handle tabs active class
    if (currentRole === 'user') {
        tabUser.classList.add('active');
        tabUser.setAttribute('aria-selected', 'true');
        tabOwner.classList.remove('active');
        tabOwner.setAttribute('aria-selected', 'false');
    } else {
        tabOwner.classList.add('active');
        tabOwner.setAttribute('aria-selected', 'true');
        tabUser.classList.remove('active');
        tabUser.setAttribute('aria-selected', 'false');
    }

    // 2. Handle Name Field visibility (Signup only)
    if (currentMode === 'signup') {
        nameFieldGroup.classList.remove('hidden');
        usernameInput.setAttribute('required', 'true');
    } else {
        nameFieldGroup.classList.add('hidden');
        usernameInput.removeAttribute('required');
        usernameInput.value = '';
    }

    // 3. Update Title, Subtitle, Submit Button, and Footer Text
    if (currentMode === 'login') {
        formTitle.textContent = currentRole === 'user' ? 'Welcome Back' : 'Owner Sign In';
        formSubtitle.textContent = currentRole === 'user'
            ? 'Please sign in to your student account to continue.'
            : 'Sign in to manage your PG listings and reservations.';
        btnSubmit.textContent = 'Sign In';
        footerText.textContent = "Don't have an account?";
        toggleActionLink.textContent = 'Sign Up';
    } else {
        formTitle.textContent = currentRole === 'user' ? 'Create Account' : 'Register as Owner';
        formSubtitle.textContent = currentRole === 'user'
            ? 'Join DiscoverPG to find your ideal student accommodation.'
            : 'Register to list your PG rooms and reach thousands of students.';
        btnSubmit.textContent = 'Create Account';
        footerText.textContent = 'Already have an account?';
        toggleActionLink.textContent = 'Sign In';
    }
}

// Set active role
window.setRole = function (role) {
    if (currentRole === role) return;
    currentRole = role;
    updateUI();
};

// Toggle form mode (Login vs Signup)
window.toggleFormMode = function () {
    currentMode = currentMode === 'login' ? 'signup' : 'login';
    updateUI();
};

// Form submission handler
async function handleAuthSubmit(e) {
    e.preventDefault();
    hideAlert();

    // Field collection
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const username = usernameInput.value.trim();

    // Basic Validation
    if (currentMode === 'signup' && !username) {
        showAlert('Please enter your username.', 'error');
        return;
    }
    if (!email) {
        showAlert('Please enter your email address.', 'error');
        return;
    }
    if (!password) {
        showAlert('Please enter your password.', 'error');
        return;
    }
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        return;
    }

    // Determine target endpoint and body payload
    let endpoint = '';
    const payload = { email, password };

    if (currentRole === 'user') {
        if (currentMode === 'login') {
            endpoint = `${API_BASE_URL}/login`;
        } else {
            endpoint = `${API_BASE_URL}/register`;
            payload.username = username;
        }
    } else {
        // PG Owner Role
        if (currentMode === 'login') {
            endpoint = `${API_BASE_URL}/loginOwner`;
        } else {
            endpoint = `${API_BASE_URL}/registerOwner`;
            payload.username = username;
        }
    }

    // Disable submit button and show loading state
    btnSubmit.disabled = true;
    const originalBtnText = btnSubmit.textContent;
    btnSubmit.textContent = currentMode === 'login' ? 'Signing In...' : 'Registering...';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            credentials: 'include' // allows backend to set the auth cookie
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        // Save login flag in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', currentRole);

        // Show success alert
        showAlert(data.message || 'Authentication successful!', 'success');
        
        // Redirect to homepage after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);

    } catch (err) {
        console.error('Auth Error:', err);
        showAlert(
            err.message.includes('Failed to fetch')
                ? 'Could not connect to the backend server. Please verify it is running on port 3100.'
                : err.message,
            'error'
        );
    } finally {
        // Restore submit button state
        btnSubmit.disabled = false;
        btnSubmit.textContent = originalBtnText;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check URL parameters for role specification
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam === 'owner' || roleParam === 'user') {
        currentRole = roleParam;
    }

    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }
    updateUI();
});
