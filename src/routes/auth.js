const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/models");
const { authenticateToken, adminOnly } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Register new user
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      bio,
      skills,
      interests,
      mentorshipAreas,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    // Validate role
    const validRoles = ["user", "mentor", "admin"];
    const userRole = role || "user";

    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: userRole,
      bio: bio || "",
      skills: skills || [],
      interests: interests || [],
      isMentor: userRole === "mentor" || userRole === "admin",
      mentorshipAreas: mentorshipAreas || [],
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token refresh endpoint
router.post("/refresh", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    // Verify the token even if expired (to get user data)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        // Allow expired tokens for refresh, but decode without verification
        decoded = jwt.decode(token);
        if (!decoded || !decoded.userId) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Token refreshed successfully",
      token: newToken,
      user: user.toObject(),
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const {
      fullName,
      email,
      bio,
      location,
      skills,
      interests,
      mentorshipAreas,
    } = req.body;

    const user = await User.findById(req.user._id);

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      user.email = email;
    }

    // Update other fields
    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (skills !== undefined) user.skills = skills;
    if (interests !== undefined) user.interests = interests;
    if (mentorshipAreas !== undefined) user.mentorshipAreas = mentorshipAreas;

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout (client-side should remove token)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" });
});

// Get user statistics
router.get("/user-stats", authenticateToken, async (req, res) => {
  try {
    const { Post, Connection } = require("../models/models");
    const userId = req.user._id;
    const username = req.user.username;

    console.log(`Calculating stats for user: ${username} (ID: ${userId})`);

    // Count posts by user (author stored as username)
    const postsCount = await Post.countDocuments({ author: username });
    console.log(`Posts count for ${username}: ${postsCount}`);

    // Count replies by user (reply.author stored as username)
    const allPosts = await Post.find();
    let repliesCount = 0;
    allPosts.forEach((post) => {
      if (post.replies) {
        const userReplies = post.replies.filter(
          (reply) => reply.author === username
        );
        repliesCount += userReplies.length;
        if (userReplies.length > 0) {
          console.log(
            `Found ${userReplies.length} replies by ${username} in post: ${post._id}`
          );
        }
      }
    });
    console.log(`Total replies count for ${username}: ${repliesCount}`);

    // Count likes on user's posts
    let likesCount = 0;
    const userPosts = await Post.find({ author: username });
    console.log(`Found ${userPosts.length} posts by ${username}`);
    userPosts.forEach((post) => {
      // likes is a number of likes
      if (typeof post.likes === "number") {
        likesCount += post.likes;
        console.log(`Post ${post._id} has ${post.likes} likes`);
      } else if (Array.isArray(post.likedBy)) {
        likesCount += post.likedBy.length;
        console.log(
          `Post ${post._id} has ${post.likedBy.length} likes from likedBy array`
        );
      }
    });
    console.log(`Total likes count for ${username}: ${likesCount}`);

    // Count mentorship connections
    const mentorshipCount = await Connection.countDocuments({
      $or: [{ mentor: userId }, { mentee: userId }],
    });
    console.log(`Mentorship connections for ${username}: ${mentorshipCount}`);

    console.log(`Final stats for ${username}:`, {
      postsCount,
      repliesCount,
      likesCount,
      mentorshipCount,
    });

    res.json({
      postsCount,
      repliesCount,
      likesCount,
      mentorshipCount,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.json({
      postsCount: 0,
      repliesCount: 0,
      likesCount: 0,
      mentorshipCount: 0,
    });
  }
});

// Admin routes
// Get all users (admin only)
router.get("/admin/users", authenticateToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.put(
  "/admin/users/:id/role",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles = ["user", "mentor", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role specified" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          role,
          isMentor: role === "mentor" || role === "admin",
        },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "User role updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Deactivate/activate user (admin only)
router.put(
  "/admin/users/:id/status",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
