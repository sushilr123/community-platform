document.addEventListener("DOMContentLoaded", () => {
  const tabContents = document.querySelectorAll(".tab-content");
  const postForms = document.querySelectorAll(".post-form");

  // Get current user from auth
  const currentUser = getCurrentUser();

  // Initialize user interface with animations
  initializeUserInterface();

  // Add modern UI enhancements
  addUIEnhancements();

  // API base URL
  const API_BASE = "/api";

  // Data storage
  let data = {
    discussions: [],
    milestones: [],
    "q-and-a": [],
    mentors: [],
  };

  // Initialize user interface
  function initializeUserInterface() {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    if (!token || !currentUser) {
      // Show login message instead of immediate redirect
      console.log("User not authenticated, showing login prompt");
      showToast("Please log in to access the community platform", "info");

      // Add a login prompt to the interface instead of redirecting immediately
      const loginPrompt = document.createElement("div");
      loginPrompt.innerHTML = `
        <div style="text-align: center; padding: 40px; background: var(--surface-color); border-radius: var(--border-radius); margin: 20px;">
          <h3>Welcome to Community Platform</h3>
          <p>Please log in or register to access all features.</p>
          <div style="margin-top: 20px;">
            <a href="login.html" style="margin-right: 10px; padding: 10px 20px; background: var(--primary-color); color: white; text-decoration: none; border-radius: var(--border-radius-sm);">Login</a>
            <a href="register.html" style="padding: 10px 20px; background: var(--accent-color); color: white; text-decoration: none; border-radius: var(--border-radius-sm);">Register</a>
          </div>
        </div>
      `;

      // Show the login prompt in the first tab
      const firstTab = document.querySelector(".tab-content");
      if (firstTab) {
        firstTab.innerHTML = loginPrompt.innerHTML;
      }

      return;
    }

    const adminTab = document.getElementById("adminTab");

    if (currentUser) {
      // Update dropdown elements
      const headerAvatar = document.getElementById("headerAvatar");
      const dropdownAvatar = document.getElementById("dropdownAvatar");
      const dropdownUserName = document.getElementById("dropdownUserName");
      const dropdownUserRole = document.getElementById("dropdownUserRole");

      // Set user avatar (first letter of username)
      const avatarLetter = currentUser.username.charAt(0).toUpperCase();
      if (headerAvatar) headerAvatar.textContent = avatarLetter;
      if (dropdownAvatar) dropdownAvatar.textContent = avatarLetter;

      // Set user name and role
      if (dropdownUserName) dropdownUserName.textContent = currentUser.username;
      if (dropdownUserRole) {
        dropdownUserRole.textContent =
          currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        dropdownUserRole.className = `user-role-badge role-${currentUser.role}`;
      }

      // Show admin tab only for admins
      if (currentUser.role === "admin") {
        adminTab.style.display = "flex";
      }

      // Show mentorship hub only for mentors
      const mentorshipHubTab = document.getElementById("mentorshipHubTab");
      if (currentUser.role === "mentor" || currentUser.isMentor) {
        mentorshipHubTab.style.display = "flex";
      }
    }

    // Initialize dropdown functionality
    initializeDropdown();

    // Initialize navigation
    initializeNavigation();

    // Initialize profile edit functionality
    initializeProfileEdit();
  }

  // Dropdown functionality
  function initializeDropdown() {
    const dropdownTrigger = document.getElementById("dropdownTrigger");
    const dropdownContent = document.getElementById("dropdownContent");
    const dropdownLogout = document.getElementById("dropdownLogout");

    // Toggle dropdown
    dropdownTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownTrigger.classList.toggle("active");
      dropdownContent.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !dropdownTrigger.contains(e.target) &&
        !dropdownContent.contains(e.target)
      ) {
        dropdownTrigger.classList.remove("active");
        dropdownContent.classList.remove("show");
      }
    });

    // Handle dropdown actions
    dropdownContent.addEventListener("click", (e) => {
      const item = e.target.closest(".dropdown-item");
      if (!item) return;

      const action = item.dataset.action;

      switch (action) {
        case "profile":
          // Switch to profile tab
          switchToTab("profile");
          break;
        case "settings":
          showToast("Settings coming soon!", "info");
          break;
        case "help":
          showToast("Help & Support coming soon!", "info");
          break;
      }

      // Close dropdown
      dropdownTrigger.classList.remove("active");
      dropdownContent.classList.remove("show");
    });

    // Logout functionality
    dropdownLogout.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Navigation functionality
  function initializeNavigation() {
    const navButtons = document.querySelectorAll(".nav-item");

    navButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        switchToTab(tab);
      });
    });
  }

  // Switch to specific tab
  function switchToTab(tabName) {
    const navButtons = document.querySelectorAll(".nav-item");
    const tabContents = document.querySelectorAll(".tab-content");

    navButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Activate selected tab
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(tabName);

    if (selectedButton) selectedButton.classList.add("active");
    if (selectedContent) selectedContent.classList.add("active");

    // Load specific content based on tab
    switch (tabName) {
      case "mentorship":
        renderMentors();
        break;
      case "profile":
        console.log("Profile tab clicked, loading user profile...");
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.log("No auth token, testing profile display with mock data");
          testProfileDisplay();
          showToast(
            "Profile loaded with test data. Please log in for real data.",
            "info"
          );
        } else {
          loadUserProfile();
        }
        break;
      case "admin":
        if (currentUser.role === "admin") {
          loadAdminData();
        }
        break;
    }
  }

  // Load admin data when admin tab is accessed
  function loadAdminData() {
    loadAdminPanel();
  }

  // API functions
  async function fetchPosts(type) {
    try {
      const response = await fetch(`${API_BASE}/posts/${type}`);
      const posts = await response.json();
      data[type] = posts;
      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  async function createPost(type, content) {
    try {
      const response = await authenticatedFetch(`${API_BASE}/posts`, {
        method: "POST",
        body: JSON.stringify({
          content,
          type,
        }),
      });
      const newPost = await response.json();
      return newPost;
    } catch (error) {
      console.error("Error creating post:", error);
      return null;
    }
  }

  async function addReply(postId, content) {
    try {
      const response = await authenticatedFetch(
        `${API_BASE}/posts/${postId}/replies`,
        {
          method: "POST",
          body: JSON.stringify({
            content,
          }),
        }
      );
      const updatedPost = await response.json();
      return updatedPost;
    } catch (error) {
      console.error("Error adding reply:", error);
      return null;
    }
  }

  async function likePost(postId) {
    try {
      const response = await authenticatedFetch(
        `${API_BASE}/posts/${postId}/like`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );
      const updatedPost = await response.json();
      return updatedPost;
    } catch (error) {
      console.error("Error liking post:", error);
      return null;
    }
  }

  async function fetchMentors() {
    try {
      const response = await fetch(`${API_BASE}/mentors`);
      const mentors = await response.json();
      data.mentors = mentors;
      return mentors;
    } catch (error) {
      console.error("Error fetching mentors:", error);
      return [];
    }
  }

  async function connectWithMentor(mentorId, message) {
    try {
      const response = await authenticatedFetch(
        `${API_BASE}/mentorship/request`,
        {
          method: "POST",
          body: JSON.stringify({
            mentorId: mentorId,
            message: message,
          }),
        }
      );

      if (response.ok) {
        const connection = await response.json();
        return connection;
      } else {
        const error = await response.json();
        // If request already sent, treat as pending to disable button
        if (
          response.status === 400 &&
          error.message === "Connection request already sent"
        ) {
          console.warn(
            "Connection request already sent for mentorId:",
            mentorId
          );
          return { status: "pending", mentor: { _id: mentorId } };
        }
        console.error("Error connecting with mentor:", error.message);
        alert(error.message || "Failed to send connection request");
        return null;
      }
    } catch (error) {
      console.error("Error connecting with mentor:", error);
      return null;
    }
  }

  // Admin functions
  async function loadAllUsers() {
    try {
      const response = await authenticatedFetch(`${API_BASE}/users`);
      const users = await response.json();
      return users;
    } catch (error) {
      console.error("Error loading users:", error);
      return [];
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      const response = await authenticatedFetch(
        `${API_BASE}/auth/admin/users/${userId}/role`,
        {
          method: "PUT",
          body: JSON.stringify({ role: newRole }),
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating user role:", error);
      return null;
    }
  }

  async function toggleUserStatus(userId, isActive) {
    try {
      const response = await authenticatedFetch(
        `${API_BASE}/auth/admin/users/${userId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ isActive }),
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating user status:", error);
      return null;
    }
  }
  // Function to render posts
  function renderPosts(tab) {
    const postsContainer = document.querySelector(`#${tab} .posts`);
    if (!postsContainer) return;

    postsContainer.innerHTML = "";

    if (!data[tab] || data[tab].length === 0) {
      postsContainer.innerHTML = "<p>No posts yet. Be the first to share!</p>";
      return;
    }

    data[tab].forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
        <div class="post-header">
          <strong>${post.author}</strong>
          <span class="post-date">${new Date(
            post.createdAt
          ).toLocaleDateString()}</span>
        </div>
        <p>${post.content}</p>
        <div class="post-actions">
          <button class="like-btn" data-post-id="${post._id}">
            ❤️ ${post.likes || 0}
          </button>
          <button class="reply-btn" data-post-id="${post._id}">Reply</button>
        </div>
        <div class="replies"></div>
        <div class="reply-form" style="display: none;">
          <textarea placeholder="Write a reply..."></textarea>
          <button data-post-id="${post._id}">Submit Reply</button>
        </div>
      `;
      postsContainer.appendChild(postElement);

      const repliesContainer = postElement.querySelector(".replies");
      if (post.replies && post.replies.length > 0) {
        post.replies.forEach((reply) => {
          const replyElement = document.createElement("div");
          replyElement.classList.add("reply");
          replyElement.innerHTML = `
            <div class="reply-header">
              <strong>${reply.author}</strong>
              <span class="reply-date">${new Date(
                reply.createdAt
              ).toLocaleDateString()}</span>
            </div>
            <p>${reply.content}</p>
          `;
          repliesContainer.appendChild(replyElement);
        });
      }
    });
  }

  // Store user's mentorship connections
  let userConnections = [];

  // Fetch current user's connections
  async function fetchUserConnections() {
    try {
      const resp = await authenticatedFetch(
        `${API_BASE}/mentorship/connections`
      );
      if (resp.ok) {
        userConnections = await resp.json();
      } else {
        console.warn(
          "Unable to fetch mentorship connections, status:",
          resp.status
        );
      }
    } catch (err) {
      console.error("Error fetching user connections:", err);
    }
  }

  // Function to render mentors
  function renderMentors() {
    const mentorsContainer = document.querySelector("#mentorship .mentors");
    if (!mentorsContainer) return;

    mentorsContainer.innerHTML = "";
    if (!data.mentors || data.mentors.length === 0) {
      mentorsContainer.innerHTML = "<p>No mentors available at the moment.</p>";
      return;
    }

    data.mentors.forEach((mentor) => {
      const mentorElement = document.createElement("div");
      mentorElement.classList.add("mentor");

      const isUser = currentUser && currentUser.role === "user";
      // Find existing connection (mentees only)
      const existing = isUser
        ? userConnections.find(
            (c) => c.mentor._id.toString() === mentor._id.toString()
          )
        : null;
      let actionHTML = "";
      if (isUser) {
        if (existing) {
          if (existing.status === "pending") {
            actionHTML =
              '<button class="connect-btn" disabled>Request Sent</button>';
          } else if (existing.status === "accepted") {
            actionHTML =
              '<button class="connect-btn" disabled>Connected</button>';
          } else {
            actionHTML = `<button class="connect-btn" data-mentor-id="${mentor._id}">Connect</button>`;
          }
        } else {
          actionHTML = `<button class="connect-btn" data-mentor-id="${mentor._id}">Connect</button>`;
        }
      } else {
        actionHTML = '<div class="mentor-info">Mentor Profile</div>';
      }

      mentorElement.innerHTML = `
        <div class="mentor-avatar">
          <div class="avatar">${mentor.username.charAt(0).toUpperCase()}</div>
        </div>
        <div class="info">
          <h3>${mentor.username}</h3>
          <p>${mentor.bio || "No bio available"}</p>
          <div class="mentor-skills">
            ${mentor.mentorshipAreas
              .map((a) => `<span class="skill-tag">${a}</span>`)
              .join("")}
          </div>
        </div>
        ${actionHTML}
      `;
      mentorsContainer.appendChild(mentorElement);
    });
  }

  // Initial data loading
  async function loadInitialData() {
    await Promise.all([
      fetchPosts("discussions"),
      fetchPosts("milestones"),
      fetchPosts("q-and-a"),
      fetchMentors(),
      fetchUserConnections(),
    ]);

    renderPosts("discussions");
    renderPosts("milestones");
    renderPosts("q-and-a");
    renderMentors();
  }

  // Load initial data
  loadInitialData();

  // Post creation
  postForms.forEach((form) => {
    form.addEventListener("click", async (e) => {
      if (e.target.tagName === "BUTTON") {
        const textarea = form.querySelector("textarea");
        const content = textarea.value.trim();
        const tab = form.parentElement.id;

        if (content) {
          const newPost = await createPost(tab, content);
          if (newPost) {
            await fetchPosts(tab);
            renderPosts(tab);
            textarea.value = "";
            await loadUserStats(); // Refresh stats after posting
          }
        }
      }
    });
  });

  // Event delegation for post interactions
  document.addEventListener("click", async (e) => {
    // Reply button functionality
    if (e.target.classList.contains("reply-btn")) {
      const replyForm = e.target.closest(".post").querySelector(".reply-form");
      replyForm.style.display =
        replyForm.style.display === "none" ? "block" : "none";
    }

    // Submit reply functionality
    if (
      e.target.tagName === "BUTTON" &&
      e.target.textContent === "Submit Reply"
    ) {
      const postId = e.target.dataset.postId;
      const tab = e.target.closest(".tab-content").id;
      const textarea = e.target.previousElementSibling;
      const content = textarea.value.trim();

      if (content) {
        const updatedPost = await addReply(postId, content);
        if (updatedPost) {
          await fetchPosts(tab);
          renderPosts(tab);
          await loadUserStats(); // Refresh stats after replying
        }
      }
    }

    // Like button functionality
    if (e.target.classList.contains("like-btn")) {
      const postId = e.target.dataset.postId;
      const tab = e.target.closest(".tab-content").id;

      const updatedPost = await likePost(postId);
      if (updatedPost) {
        await fetchPosts(tab);
        renderPosts(tab);
        await loadUserStats(); // Refresh stats after liking
      }
    }

    // Connect with mentor functionality
    if (e.target.classList.contains("connect-btn")) {
      // Ignore clicks on disabled connect buttons
      if (e.target.disabled) return;
      const mentorId = e.target.dataset.mentorId;
      const mentorName = e.target
        .closest(".mentor")
        .querySelector("h3").textContent;

      // Only regular users can send requests
      if (currentUser.role !== "user") {
        alert("Only regular users can request mentorship connections.");
        return;
      }

      const message = prompt(
        `Send a message to ${mentorName}:`,
        "Hi! I'd like to connect with you as a mentor."
      );

      if (message !== null && message.trim()) {
        const connection = await connectWithMentor(mentorId, message.trim());
        // Refresh connections and update mentor list regardless of outcome
        await fetchUserConnections();
        renderMentors();
        if (connection) {
          alert(`Connection request sent to ${mentorName}!`);
        }
      }
    }
  });

  // Admin Panel Functions
  function loadAdminPanel() {
    const loadUsersBtn = document.getElementById("loadUsersBtn");
    const statsContainer = document.getElementById("statsContainer");

    // Load users button event
    loadUsersBtn.addEventListener("click", displayUsersTable);

    // Load stats
    loadStats();
  }

  async function displayUsersTable() {
    const users = await loadAllUsers();
    const usersTable = document.getElementById("usersTable");

    if (users.length === 0) {
      usersTable.innerHTML = "<p>No users found.</p>";
      return;
    }

    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    users.forEach((user) => {
      tableHTML += `
        <tr>
          <td>${user.username}</td>
          <td>
            <select class="role-select" data-user-id="${
              user._id
            }" data-current-role="${user.role}">
              <option value="user" ${
                user.role === "user" ? "selected" : ""
              }>User</option>
              <option value="mentor" ${
                user.role === "mentor" ? "selected" : ""
              }>Mentor</option>
              <option value="admin" ${
                user.role === "admin" ? "selected" : ""
              }>Admin</option>
            </select>
          </td>
          <td>
            <button class="status-toggle ${
              user.isActive ? "status-active" : "status-inactive"
            }" 
                    data-user-id="${user._id}" data-current-status="${
        user.isActive
      }">
              ${user.isActive ? "Active" : "Inactive"}
            </button>
          </td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
          <td>${
            user.lastLogin
              ? new Date(user.lastLogin).toLocaleDateString()
              : "Never"
          }</td>
          <td>
            <button class="admin-btn" onclick="saveUserChanges('${
              user._id
            }')">Save</button>
          </td>
        </tr>
      `;
    });

    tableHTML += "</tbody></table>";
    usersTable.innerHTML = tableHTML;

    // Add event listeners for role changes and status toggles
    document.querySelectorAll(".status-toggle").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const userId = e.target.dataset.userId;
        const currentStatus = e.target.dataset.currentStatus === "true";
        const newStatus = !currentStatus;

        const result = await toggleUserStatus(userId, newStatus);
        if (result) {
          e.target.textContent = newStatus ? "Active" : "Inactive";
          e.target.className = `status-toggle ${
            newStatus ? "status-active" : "status-inactive"
          }`;
          e.target.dataset.currentStatus = newStatus;
        }
      });
    });
  }

  // Global function for saving user changes (role)
  window.saveUserChanges = async function (userId) {
    const roleSelect = document.querySelector(
      `.role-select[data-user-id="${userId}"]`
    );
    const newRole = roleSelect.value;
    const currentRole = roleSelect.dataset.currentRole;

    if (newRole !== currentRole) {
      const result = await updateUserRole(userId, newRole);
      if (result) {
        roleSelect.dataset.currentRole = newRole;
        alert("User role updated successfully!");
      } else {
        alert("Failed to update user role.");
        roleSelect.value = currentRole; // Revert selection
      }
    }
  };

  async function loadStats() {
    try {
      // Get platform statistics
      const [discussions, milestones, qAndA, mentors] = await Promise.all([
        fetchPosts("discussions"),
        fetchPosts("milestones"),
        fetchPosts("q-and-a"),
        fetchMentors(),
      ]);

      const statsContainer = document.getElementById("statsContainer");
      statsContainer.innerHTML = `
        <div class="stat-card">
          <h4>Total Discussions</h4>
          <div class="stat-number">${discussions.length}</div>
        </div>
        <div class="stat-card">
          <h4>Milestones Shared</h4>
          <div class="stat-number">${milestones.length}</div>
        </div>
        <div class="stat-card">
          <h4>Questions Asked</h4>
          <div class="stat-number">${qAndA.length}</div>
        </div>
        <div class="stat-card">
          <h4>Active Mentors</h4>
          <div class="stat-number">${mentors.length}</div>
        </div>
      `;
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }
  // Profile Management Functions
  async function loadUserProfile() {
    console.log("Loading user profile...");

    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      showToast(
        "Please log in to view your profile. Redirecting to login...",
        "error"
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }

    console.log("Auth token found:", token ? "Yes" : "No");

    try {
      // Get user profile data
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Profile API response status:", response.status);

      if (response.ok) {
        const profileData = await response.json();
        console.log("Profile data received:", profileData);
        displayUserProfile(profileData);
        await loadUserStats();
      } else {
        console.error("Failed to load profile");
        showToast("Failed to load profile", "error");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast("Error loading profile", "error");
    }
  }

  function getRoleBadge(role) {
    const roleClasses = {
      admin: "role-admin",
      mentor: "role-mentor",
      user: "role-user",
    };

    const roleNames = {
      admin: "Admin",
      mentor: "Mentor",
      user: "User",
    };

    return `<span class="user-role-badge ${
      roleClasses[role] || roleClasses.user
    }">${roleNames[role] || roleNames.user}</span>`;
  }

  // Test function to simulate profile data (for debugging)
  function testProfileDisplay() {
    console.log("Testing profile display with mock data...");
    const mockProfileData = {
      username: "testuser",
      role: "user",
      fullName: "Test User",
      email: "test@example.com",
      bio: "This is a test user profile",
      location: "Test City",
      skills: ["JavaScript", "React", "Node.js"],
      createdAt: new Date().toISOString(),
    };
    displayUserProfile(mockProfileData);
  }

  // Make test function available globally for debugging
  window.testProfileDisplay = testProfileDisplay;
  window.loadUserProfile = loadUserProfile;

  function displayUserProfile(profileData) {
    console.log("Displaying user profile with data:", profileData);

    // Update profile header
    const profileAvatar = document.getElementById("profileAvatar");
    const profileUsername = document.getElementById("profileUsername");
    const profileRole = document.getElementById("profileRole");
    const profileJoined = document.getElementById("profileJoined");

    console.log("Profile elements found:", {
      profileAvatar: !!profileAvatar,
      profileUsername: !!profileUsername,
      profileRole: !!profileRole,
      profileJoined: !!profileJoined,
    });

    if (!profileAvatar || !profileUsername || !profileRole || !profileJoined) {
      console.error("Some profile elements not found in DOM");
      return;
    }

    profileAvatar.textContent = profileData.username.charAt(0).toUpperCase();
    profileUsername.textContent = profileData.username;
    profileRole.innerHTML = getRoleBadge(profileData.role);

    // Format join date
    const joinDate = new Date(profileData.createdAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    profileJoined.textContent = `Member since ${joinDate}`;

    // Update profile details
    document.getElementById("displayFullName").textContent =
      profileData.fullName || "-";
    document.getElementById("displayEmail").textContent =
      profileData.email || "-";
    document.getElementById("displayBio").textContent = profileData.bio || "-";
    document.getElementById("displayLocation").textContent =
      profileData.location || "-";

    // Update skills
    const skillsContainer = document.getElementById("displaySkills");
    skillsContainer.innerHTML = "";
    if (profileData.skills && profileData.skills.length > 0) {
      profileData.skills.forEach((skill) => {
        const skillElement = document.createElement("span");
        skillElement.className = "skill-item";
        skillElement.textContent = skill;
        skillsContainer.appendChild(skillElement);
      });
    } else {
      skillsContainer.innerHTML =
        '<span style="color: var(--text-light);">No skills added yet</span>';
    }

    // Fill edit form
    fillEditForm(profileData);
  }

  function fillEditForm(profileData) {
    document.getElementById("editFullName").value = profileData.fullName || "";
    document.getElementById("editEmail").value = profileData.email || "";
    document.getElementById("editBio").value = profileData.bio || "";
    document.getElementById("editLocation").value = profileData.location || "";
    document.getElementById("editSkills").value = profileData.skills
      ? profileData.skills.join(", ")
      : "";
  }

  async function loadUserStats() {
    try {
      const response = await fetch(`${API_BASE}/auth/user-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const stats = await response.json();
        document.getElementById("postsCount").textContent =
          stats.postsCount || 0;
        document.getElementById("repliesCount").textContent =
          stats.repliesCount || 0;
        document.getElementById("likesCount").textContent =
          stats.likesCount || 0;
        document.getElementById("mentorshipCount").textContent =
          stats.mentorshipCount || 0;
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  }

  // Profile Edit Functionality
  function initializeProfileEdit() {
    const editBtn = document.getElementById("editProfileBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const profileForm = document.getElementById("profileForm");
    const profileView = document.getElementById("profileView");
    const profileEdit = document.getElementById("profileEdit");

    editBtn.addEventListener("click", () => {
      profileView.style.display = "none";
      profileEdit.style.display = "block";
    });

    cancelBtn.addEventListener("click", () => {
      profileEdit.style.display = "none";
      profileView.style.display = "block";
      // Reset form to original values
      loadUserProfile();
    });

    profileForm.addEventListener("submit", handleProfileUpdate);
  }

  async function handleProfileUpdate(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const profileData = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      bio: formData.get("bio"),
      location: formData.get("location"),
      skills: formData
        .get("skills")
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill),
    };

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        showToast("Profile updated successfully!", "success");

        // Switch back to view mode
        document.getElementById("profileEdit").style.display = "none";
        document.getElementById("profileView").style.display = "block";

        // Reload profile
        loadUserProfile();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Error updating profile", "error");
    }
  }

  // Modern UI Enhancements
  function addUIEnhancements() {
    // Add loading states to buttons
    addLoadingStates();

    // Add smooth scrolling
    addSmoothScrolling();

    // Add hover effects for cards
    addCardHoverEffects();

    // Add typing animation for textareas
    addTypingAnimations();

    // Add toast notifications
    initializeToastSystem();

    // Add keyboard shortcuts
    addKeyboardShortcuts();

    // Add notification functionality
    initializeNotifications();

    // Add search functionality
    initializeSearch();
  }

  // Notification functionality
  function initializeNotifications() {
    const notificationBtn = document.getElementById("notificationBtn");
    const notificationBadge = document.getElementById("notificationBadge");

    notificationBtn.addEventListener("click", () => {
      showToast("Notifications feature coming soon! 🔔", "info");
      // Hide badge after clicking
      notificationBadge.style.display = "none";
    });
  }

  // Search functionality
  function initializeSearch() {
    const searchBtn = document.getElementById("searchBtn");

    searchBtn.addEventListener("click", () => {
      showToast("Search feature coming soon! 🔍", "info");
    });
  }

  function addLoadingStates() {
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      const originalClick = button.onclick;
      button.addEventListener("click", function (e) {
        if (this.classList.contains("loading")) return;

        this.classList.add("loading");
        this.style.position = "relative";
        this.style.color = "transparent";

        // Add spinner
        const spinner = document.createElement("div");
        spinner.innerHTML = "⟳";
        spinner.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: spin 1s linear infinite;
          color: white;
        `;
        this.appendChild(spinner);

        setTimeout(() => {
          this.classList.remove("loading");
          this.style.color = "";
          spinner.remove();
        }, 1000);
      });
    });

    // Add CSS for spin animation
    if (!document.getElementById("spin-style")) {
      const style = document.createElement("style");
      style.id = "spin-style";
      style.textContent = `
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function addSmoothScrolling() {
    document.documentElement.style.scrollBehavior = "smooth";
  }

  function addCardHoverEffects() {
    const cards = document.querySelectorAll(".post, .mentor, .stat-card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)";
        this.style.transition = "transform 0.2s ease";
      });

      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
      });
    });
  }

  function addTypingAnimations() {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      textarea.addEventListener("input", function () {
        this.style.borderColor = "var(--primary-color)";
        this.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
          this.style.borderColor = "var(--border-color)";
          this.style.boxShadow = "none";
        }, 2000);
      });
    });
  }

  function initializeToastSystem() {
    // Create toast container
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);

    // Global toast function
    window.showToast = function (message, type = "info") {
      const toast = document.createElement("div");
      toast.style.cssText = `
        background: ${
          type === "success"
            ? "var(--accent-color)"
            : type === "error"
            ? "var(--danger-color)"
            : "var(--primary-color)"
        };
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius-sm);
        margin-bottom: 10px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        pointer-events: auto;
        box-shadow: var(--shadow-lg);
        font-size: 14px;
        font-weight: 500;
      `;
      toast.textContent = message;

      toastContainer.appendChild(toast);

      // Animate in
      setTimeout(() => {
        toast.style.transform = "translateX(0)";
      }, 10);

      // Auto remove
      setTimeout(() => {
        toast.style.transform = "translateX(100%)";
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3000);
    };
  }

  function addKeyboardShortcuts() {
    document.addEventListener("keydown", function (e) {
      // Ctrl/Cmd + Enter to submit forms
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        const activeElement = document.activeElement;
        if (activeElement.tagName === "TEXTAREA") {
          const form =
            activeElement.closest("form") ||
            activeElement.closest(".post-form");
          const submitBtn = form?.querySelector(
            'button[type="submit"], button:not([type])'
          );
          if (submitBtn) {
            submitBtn.click();
            e.preventDefault();
          }
        }
      }

      // Number keys for tab navigation
      if (e.altKey && e.key >= "1" && e.key <= "5") {
        const tabIndex = parseInt(e.key) - 1;
        const navButtons = document.querySelectorAll("nav button");
        if (navButtons[tabIndex]) {
          navButtons[tabIndex].click();
          e.preventDefault();
        }
      }
    });
  }
});
