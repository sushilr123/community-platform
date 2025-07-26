// AI-powered routes for the community platform
const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const { authenticateToken } = require("../middleware/auth");
const { User, Post } = require("../models/models");

// AI Chatbot endpoint
router.post("/chat", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // In a real app, you'd fetch user context and conversation history here
    const user = await User.findById(userId).select(
      "username role interests skills"
    );
    const history = []; // Placeholder for conversation history

    const reply = await aiService.getChatbotReply(message, user, history);

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot route error:", error);
    // Check for specific AI service errors
    if (error.message.includes("quota")) {
      return res
        .status(429)
        .json({
          message:
            "AI service is temporarily unavailable due to high demand. Please try again later.",
        });
    }
    res.status(500).json({ message: "Error processing your request." });
  }
});

// Smart content recommendations
router.get("/recommendations", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Fetch a variety of recent posts to provide a good base for recommendations
    const recentPosts = await Post.find({ author: { $ne: user._id } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("author", "username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const recommendations = await aiService.getContentRecommendations(
      user,
      recentPosts
    );

    res.json(recommendations);
  } catch (error) {
    console.error("Content recommendation error:", error);
    if (
      error.status === 429 ||
      (error.response && error.response.status === 429)
    ) {
      // Gracefully degrade when quota is exceeded
      res.json([
        {
          id: "1",
          title: "Explore Discussions",
          reason: "Discover what the community is talking about.",
          link: "#",
        },
        {
          id: "2",
          title: "Find a Mentor",
          reason: "Connect with experienced members to guide you.",
          link: "#",
        },
        {
          id: "3",
          title: "Ask a Question",
          reason: "Get answers to your questions from the community.",
          link: "#",
        },
      ]);
    } else {
      res.status(500).json({ message: "Could not fetch recommendations." });
    }
  }
});

// Smart mentor matching
router.get("/mentor-match", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mentors = await User.find({ isMentor: true, isActive: true });

    const matches = await aiService.findBestMentors(user, mentors);

    res.json({
      success: true,
      matches: matches,
      total_mentors: mentors.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Mentor matching service unavailable",
    });
  }
});

// Auto-generate tags for posts
router.post("/generate-tags", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const tags = await aiService.generateTags(content);

    res.json({
      success: true,
      tags: tags,
      content_preview: content.substring(0, 100) + "...",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Tag generation service unavailable",
    });
  }
});

// Sentiment analysis
router.post("/analyze-sentiment", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const sentiment = await aiService.analyzeSentiment(text);

    res.json({
      success: true,
      sentiment: sentiment,
      text_preview: text.substring(0, 50) + "...",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Sentiment analysis service unavailable",
    });
  }
});

// Content moderation
router.post("/moderate-content", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const moderation = await aiService.moderateContent(content);

    res.json({
      success: true,
      moderation: moderation,
      safe_to_post: !moderation.flagged,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Content moderation service unavailable",
    });
  }
});

// AI-powered search
router.get("/smart-search", authenticateToken, async (req, res) => {
  try {
    const { query, type } = req.query;

    // Get all posts of specified type or all types
    let searchFilter = {};
    if (type && type !== "all") {
      searchFilter.type = type;
    }

    const posts = await Post.find(searchFilter);

    // Use AI to find most relevant posts
    const relevantPosts = await aiService.getContentRecommendations(
      { interests: [query], skills: [] },
      posts
    );

    res.json({
      success: true,
      query: query,
      results: relevantPosts,
      total_searched: posts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Smart search service unavailable",
    });
  }
});

// AI health check
router.get("/health", async (req, res) => {
  try {
    // Test AI service connectivity
    const testResponse = await aiService.chatbot(
      "Hello, are you working?",
      "Health check"
    );

    res.json({
      success: true,
      ai_status: "operational",
      test_response: testResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      ai_status: "unavailable",
      error: error.message,
    });
  }
});

module.exports = router;
