document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "/api";
  const currentUser = getCurrentUser();

  console.log("Mentorship page loaded, currentUser:", currentUser);

  if (!currentUser) {
    console.error("No current user found. Redirecting to login page.");
    window.location.href = "login.html";
    return;
  }

  // Validate user data structure
  if (!currentUser._id) {
    console.error("Invalid user data - missing _id:", currentUser);
    alert("Invalid user session. Please log in again.");
    removeAuthToken();
    window.location.href = "login.html";
    return;
  }

  // Check authentication token
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found");
    window.location.href = "login.html";
    return;
  }

  console.log("Authentication token exists:", !!token);
  console.log("User ID:", currentUser._id);
  console.log("User role:", currentUser.role);
  console.log("Is mentor:", currentUser.isMentor);

  // Both mentors and regular users (mentees) can access the mentorship hub

  const requestsList = document.getElementById("requests-list");
  const activeList = document.getElementById("active-list");
  const chatWelcome = document.getElementById("chat-welcome");
  const chatArea = document.getElementById("chat-area");
  const chatWithUsername = document.getElementById("chat-with-username");
  const messagesContainer = document.getElementById("messages-container");
  const messageInput = document.getElementById("message-input");
  const sendMessageBtn = document.getElementById("send-message-btn");

  let activeConnection = null;

  async function loadConnections() {
    try {
      console.log("Loading connections for user:", currentUser._id);
      console.log("User role:", currentUser.role);
      console.log("User isMentor:", currentUser.isMentor);

      const response = await authenticatedFetch(
        `${API_BASE}/mentorship/connections`
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to load connections:", errorData);
        console.error("Response status:", response.status);
        console.error("Response statusText:", response.statusText);

        // Check if it's an authentication issue
        if (response.status === 401) {
          console.error("Unauthorized - token might be expired");
          alert("Your session has expired. Please log in again.");
          removeAuthToken();
          window.location.href = "login.html";
          return;
        }

        if (response.status === 403) {
          console.error("Forbidden - access denied or invalid token");
          alert(
            "Your session has expired or you are not authorized. Please log in again."
          );
          // Clear stored authentication and redirect to login
          removeAuthToken();
          window.location.href = "login.html";
          return;
        }

        // Show generic error message for other status codes
        alert(
          `Failed to load connections: ${
            errorData.message || errorData.error || "Unknown error"
          }`
        );
        return;
      }

      const connections = await response.json();
      console.log("Loaded connections:", connections);
      renderConnections(connections);
    } catch (error) {
      console.error("Error loading connections:", error);
    }
  }

  function renderConnections(connections) {
    console.log("Rendering connections:", connections);

    requestsList.innerHTML = "";
    activeList.innerHTML = "";

    console.log("Rendering connections:", connections);
    console.log("Current user:", currentUser);

    if (!connections || connections.length === 0) {
      const isMentor = currentUser.role === "mentor" || currentUser.isMentor;

      if (isMentor) {
        requestsList.innerHTML = `
          <div class="welcome-message">
            <h3>🤝 Welcome to Your Mentorship Hub!</h3>
            <p>As a mentor, you can guide and support learners on their journey!</p>
            <ul>
              <li>� Mentees will send you connection requests.</li>
              <li>✅ Review and accept requests from learners you'd like to mentor.</li>
              <li>💬 Start private conversations to provide personalized guidance.</li>
            </ul>
            <p><em>Pending connection requests will appear here for you to accept or decline.</em></p>
          </div>
        `;
      } else {
        requestsList.innerHTML = `
          <div class="welcome-message">
            <h3>🤝 Welcome to Your Mentorship Hub!</h3>
            <p>Connect with a Mentor to start your personalized learning journey!</p>
            <ul>
              <li>👉 Find mentors on the main page and send connection requests.</li>
              <li>⏳ Wait for mentors to accept your requests.</li>
              <li>💬 Start 1:1 conversations, ask questions, and grow faster with expert support.</li>
            </ul>
            <p><em>Your sent requests and accepted connections will appear here.</em></p>
          </div>
        `;
      }

      activeList.innerHTML =
        "<p>No active connections yet. Accepted connections will appear here.</p>";
      return;
    }

    connections.forEach((conn) => {
      // Use string comparison for IDs to be safe
      const isMentor =
        conn.mentor._id.toString() === currentUser._id.toString();
      const otherUser = isMentor ? conn.mentee : conn.mentor;

      console.log(
        `Connection ${conn._id}: isMentor=${isMentor}, status=${conn.status}, otherUser=${otherUser.username}`
      );

      const item = document.createElement("div");
      item.className = "connection-item";
      item.dataset.connectionId = conn._id;

      let html = `
        <div class="connection-item-header">
          <h4>${otherUser.username}</h4>
          <span class="connection-status status-${conn.status}">${
        conn.status
      }</span>
        </div>
        <p>Role: ${isMentor ? "Mentee" : "Mentor"}</p>
        <p>Message: "${conn.message}"</p>
      `;

      // Show accept/decline buttons only for mentors on pending requests
      if (conn.status === "pending" && isMentor) {
        html += `
          <div class="connection-actions">
            <button class="accept-btn" data-id="${conn._id}">Accept</button>
            <button class="decline-btn" data-id="${conn._id}">Decline</button>
          </div>
        `;
      }

      // Show status info for mentees on pending requests
      if (conn.status === "pending" && !isMentor) {
        html += `
          <div class="connection-info">
            <p style="font-style: italic; color: #666;">Waiting for mentor to respond...</p>
          </div>
        `;
      }

      item.innerHTML = html;

      if (conn.status === "pending") {
        requestsList.appendChild(item);
      } else if (conn.status === "accepted") {
        activeList.appendChild(item);
        // Make the item clickable for accepted connections
        item.style.cursor = "pointer";
        item.style.transition = "background-color 0.2s";
        item.addEventListener("click", () => selectConnection(conn));
        item.addEventListener("mouseenter", () => {
          item.style.backgroundColor = "#f0f8ff";
        });
        item.addEventListener("mouseleave", () => {
          item.style.backgroundColor = "";
        });
      }
    });
  }

  async function updateConnectionStatus(id, status) {
    try {
      const response = await authenticatedFetch(
        `${API_BASE}/mentorship/connections/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          console.error("Forbidden - access denied");
          alert(
            "Access denied. You don't have permission to access this resource."
          );
          // Clear invalid token and redirect
          removeAuthToken();
          window.location.href = "login.html";
          return;
        }
      }
    } catch (error) {
      console.error("Error updating connection:", error);
      alert("Error updating connection. Please try again.");
    }
  }

  function selectConnection(connection) {
    console.log("Selecting connection:", connection);
    activeConnection = connection;
    chatWelcome.classList.add("hidden");
    chatArea.classList.remove("hidden");

    const isMentor =
      connection.mentor._id.toString() === currentUser._id.toString();
    const otherUser = isMentor ? connection.mentee : connection.mentor;

    chatWithUsername.textContent = `Chat with ${otherUser.username}`;

    // Clear previous messages before loading new ones
    messagesContainer.innerHTML =
      '<p style="text-align: center; color: #666;">Loading messages...</p>';

    loadMessages(connection._id);
  }

  async function loadMessages(connectionId) {
    try {
      console.log("Loading messages for connection:", connectionId);
      const response = await authenticatedFetch(
        `${API_BASE}/mentorship/connections/${connectionId}/messages`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to load messages:", errorData);
        return;
      }

      const messages = await response.json();
      console.log("Loaded messages:", messages);
      renderMessages(messages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  function renderMessages(messages) {
    console.log("Rendering messages:", messages);
    messagesContainer.innerHTML = "";

    if (!messages || messages.length === 0) {
      messagesContainer.innerHTML =
        '<p style="text-align: center; color: #666;">No messages yet. Start the conversation!</p>';
      return;
    }

    messages.forEach((msg) => {
      const messageEl = document.createElement("div");
      const isSent = msg.sender.toString() === currentUser._id.toString();
      messageEl.className = `message ${isSent ? "sent" : "received"}`;

      const messageContent = document.createElement("div");
      messageContent.className = "message-content";
      messageContent.textContent = msg.content;

      const messageTime = document.createElement("div");
      messageTime.className = "message-time";
      messageTime.textContent = new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      messageEl.appendChild(messageContent);
      messageEl.appendChild(messageTime);
      messagesContainer.appendChild(messageEl);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !activeConnection) return;

    try {
      console.log("Sending message:", content);
      const response = await authenticatedFetch(
        `${API_BASE}/mentorship/connections/${activeConnection._id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send message:", errorData);
        alert("Failed to send message. Please try again.");
        return;
      }

      console.log("Message sent successfully");
      messageInput.value = "";
      loadMessages(activeConnection._id);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Please try again.");
    }
  }

  // Event Listeners
  requestsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("accept-btn")) {
      updateConnectionStatus(e.target.dataset.id, "accepted");
    }
    if (e.target.classList.contains("decline-btn")) {
      updateConnectionStatus(e.target.dataset.id, "declined");
    }
  });

  sendMessageBtn.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Initial Load
  loadConnections();
});
