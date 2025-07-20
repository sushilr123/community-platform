// Debug script to test mentorship API endpoints

async function testMentorshipAPI() {
  const API_BASE = "http://localhost:3000/api";

  // Get the current user and token from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const token = localStorage.getItem("authToken");

  console.log("=== MENTORSHIP API DEBUG ===");
  console.log("Current User:", currentUser);
  console.log("Auth Token exists:", !!token);
  console.log(
    "Token preview:",
    token ? token.substring(0, 20) + "..." : "No token"
  );

  if (!currentUser || !token) {
    console.error("Missing user data or token");
    return;
  }

  try {
    console.log("\n--- Testing /api/mentorship/connections ---");
    const response = await fetch(`${API_BASE}/mentorship/connections`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response OK:", response.ok);
    console.log(
      "Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log("Response Data:", data);

    if (!response.ok) {
      console.error("ERROR:", data);
    } else {
      console.log("SUCCESS: Found", data.length, "connections");
    }
  } catch (error) {
    console.error("Request failed:", error);
  }
}

// Run the test when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Add a button to run the test manually
  const debugBtn = document.createElement("button");
  debugBtn.textContent = "Debug Mentorship API";
  debugBtn.style.cssText =
    "position:fixed;top:10px;right:10px;z-index:9999;padding:10px;background:red;color:white;border:none;cursor:pointer;";
  debugBtn.onclick = testMentorshipAPI;
  document.body.appendChild(debugBtn);
});
