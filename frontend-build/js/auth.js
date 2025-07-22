// Authentication utility functions
const API_BASE = "/api";

// Store auth token in localStorage
function setAuthToken(token) {
  localStorage.setItem("authToken", token);
}

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Remove auth token
function removeAuthToken() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
}

// Store current user info
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Get current user info
function getCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

// Show message to user
function showMessage(message, type = "info") {
  const messageDiv = document.getElementById("message");
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = "block";

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 5000);
  }
}

// Login function
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
      showMessage("Login successful! Redirecting...", "success");

      // Redirect to main app after successful login
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      showMessage(data.error || "Login failed", "error");
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error");
    console.error("Login error:", error);
  }
}

// Register function
async function register(userData) {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
      showMessage(
        "Registration successful! Welcome to the community!",
        "success"
      );

      // Redirect to main app after successful registration
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else {
      showMessage(data.error || "Registration failed", "error");
    }
  } catch (error) {
    showMessage("Network error. Please try again.", "error");
    console.error("Registration error:", error);
  }
}

// Logout function
async function logout() {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    removeAuthToken();
    window.location.href = "login.html";
  }
}

// Check if user is authenticated
function isAuthenticated() {
  const token = getAuthToken();
  const user = getCurrentUser();
  return token && user;
}

// Check user role
function hasRole(requiredRole) {
  const user = getCurrentUser();
  if (!user) return false;

  const roleHierarchy = { user: 1, mentor: 2, admin: 3 };
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

// Make authenticated API request
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const defaultOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      window.location.href = "login.html";
      return;
    }

    return response;
  } catch (error) {
    console.error("Authenticated fetch error:", error);
    throw error;
  }
}

// Redirect if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Redirect if not authorized for specific role
function requireRole(requiredRole) {
  if (!requireAuth()) return false;

  if (!hasRole(requiredRole)) {
    showMessage(`Access denied. Required role: ${requiredRole}`, "error");
    return false;
  }
  return true;
}

// Get user role badge HTML
function getRoleBadge(role) {
  const badges = {
    user: '<span class="role-badge role-user">User</span>',
    mentor: '<span class="role-badge role-mentor">Mentor</span>',
    admin: '<span class="role-badge role-admin">Admin</span>',
  };
  return badges[role] || "";
}

// Initialize auth check on page load
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  // Skip auth check for login and register pages
  if (currentPage === "login.html" || currentPage === "register.html") {
    // If already authenticated, redirect to main app
    if (isAuthenticated()) {
      window.location.href = "index.html";
    }
    return;
  }

  // Require authentication for all other pages
  if (currentPage !== "login.html" && currentPage !== "register.html") {
    requireAuth();
  }
});
