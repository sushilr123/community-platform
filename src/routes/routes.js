const express = require("express");
const router = express.Router();
const { User, Post, Mentorship } = require("../models/models");
const {
  authenticateToken,
  authorizeRole,
  adminOnly,
  mentorOrAdmin,
} = require("../middleware/auth");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running properly",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get all posts by type (public access)
router.get("/posts/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const posts = await Post.find({ type }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new post (authenticated users only)
router.post("/posts", authenticateToken, async (req, res) => {
  try {
    const { content, type, tags } = req.body;
    const newPost = new Post({
      author: req.user.username,
      content,
      type,
      tags: tags || [],
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a reply to a post (authenticated users only)
router.post("/posts/:id/replies", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.replies.push({ author: req.user.username, content });
    post.updatedAt = new Date();
    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a post (authenticated users only)
router.post("/posts/:id/like", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const username = req.user.username;

    if (post.likedBy.includes(username)) {
      // Unlike the post
      post.likedBy = post.likedBy.filter((user) => user !== username);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like the post
      post.likedBy.push(username);
      post.likes += 1;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get("/users", authenticateToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-email -password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user (removed - users should register through auth routes)
// This route is now handled by /api/auth/register

// Get mentors (public access)
router.get("/mentors", async (req, res) => {
  try {
    const mentors = await User.find({ isMentor: true, isActive: true }).select(
      "-email -password"
    );
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create mentorship connection (authenticated users only)
router.post("/mentorship", authenticateToken, async (req, res) => {
  try {
    const { mentor, message } = req.body;

    // Check if connection already exists
    const existingConnection = await Mentorship.findOne({
      mentor,
      mentee: req.user.username,
    });
    if (existingConnection) {
      return res
        .status(400)
        .json({ error: "Mentorship connection already exists" });
    }

    const newMentorship = new Mentorship({
      mentor,
      mentee: req.user.username,
      message: message || "",
    });
    const savedMentorship = await newMentorship.save();
    res.status(201).json(savedMentorship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search posts
router.get("/search", async (req, res) => {
  try {
    const { q, type } = req.query;
    let searchQuery = {};

    if (q) {
      searchQuery.$or = [
        { content: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }

    if (type && type !== "all") {
      searchQuery.type = type;
    }

    const posts = await Post.find(searchQuery).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
