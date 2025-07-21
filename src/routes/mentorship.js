const express = require("express");
const router = express.Router();
const { User, Connection, Message } = require("../models/models");
const { authenticateToken } = require("../middleware/auth");

// Request mentorship connection
router.post("/request", authenticateToken, async (req, res) => {
  const { mentorId, message } = req.body;
  const menteeId = req.user._id;

  if (req.user.role !== "user") {
    return res
      .status(403)
      .json({ message: "Only users can initiate mentorship requests." });
  }

  try {
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.isMentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const existingConnection = await Connection.findOne({
      mentor: mentorId,
      mentee: menteeId,
    });
    if (existingConnection) {
      // Return existing pending or accepted connection
      return res.json(existingConnection);
    }

    const connection = new Connection({
      mentor: mentorId,
      mentee: menteeId,
      message,
    });
    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all connections for a user
router.get("/connections", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  console.log("Loading connections for user:", {
    userId: userId,
    userRole: req.user.role,
    isMentor: req.user.isMentor,
  });

  try {
    const connections = await Connection.find({
      $or: [{ mentor: userId }, { mentee: userId }],
    })
      .populate("mentor", "username")
      .populate("mentee", "username");

    console.log(`Found ${connections.length} connections for user ${userId}`);
    res.json(connections);
  } catch (error) {
    console.error("Error loading connections:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update connection status
router.put("/connections/:id", authenticateToken, async (req, res) => {
  const { status } = req.body;
  const connectionId = req.params.id;
  const userId = req.user._id;

  try {
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    // Allow both mentor and mentee to update status, but mentors primarily accept/decline
    if (
      connection.mentor.toString() !== userId.toString() &&
      connection.mentee.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    connection.status = status;
    await connection.save();

    // Populate the connection with user details before sending response
    await connection.populate("mentor", "username");
    await connection.populate("mentee", "username");

    res.json(connection);
  } catch (error) {
    console.error("Error updating connection:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get messages for a connection
router.get("/connections/:id/messages", authenticateToken, async (req, res) => {
  const connectionId = req.params.id;
  const userId = req.user._id;

  try {
    // Verify user is part of this connection
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (
      connection.mentor.toString() !== userId.toString() &&
      connection.mentee.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view messages" });
    }

    const messages = await Message.find({ connection: connectionId }).sort({
      createdAt: "asc",
    });
    res.json(messages);
  } catch (error) {
    console.error("Error loading messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send a message
router.post(
  "/connections/:id/messages",
  authenticateToken,
  async (req, res) => {
    const { content } = req.body;
    const connectionId = req.params.id;
    const senderId = req.user._id;

    try {
      const connection = await Connection.findById(connectionId);
      if (!connection || connection.status !== "accepted") {
        return res.status(400).json({ message: "Connection not active" });
      }

      // Verify sender is part of this connection
      if (
        connection.mentor.toString() !== senderId.toString() &&
        connection.mentee.toString() !== senderId.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to send messages" });
      }

      const receiverId =
        connection.mentor.toString() === senderId.toString()
          ? connection.mentee
          : connection.mentor;

      const message = new Message({
        connection: connectionId,
        sender: senderId,
        receiver: receiverId,
        content,
      });
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
