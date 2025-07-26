const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
const authRoutes = require("./src/routes/auth");
const postRoutes = require("./src/routes/routes");
const mentorshipRoutes = require("./src/routes/mentorship");
const aiRoutes = require("./src/routes/ai");

app.use("/api/auth", authRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", postRoutes);

// Serve static HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/mentorship.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "mentorship.html"));
});

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch (err) {
      console.log("Socket authentication failed:", err.message);
      next(); // Allow connection but mark as unauthenticated
    }
  } else {
    next(); // Allow connection but mark as unauthenticated
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(
    "A user connected",
    socket.id,
    socket.username ? `(${socket.username})` : "(anonymous)"
  );

  socket.on("joinRoom", ({ connectionId }) => {
    if (!socket.userId) {
      socket.emit("error", { message: "Authentication required for chat" });
      return;
    }
    socket.join(connectionId);
    console.log(`User ${socket.username} joined room: ${connectionId}`);
  });

  socket.on("sendMessage", async ({ connectionId, message }) => {
    if (!socket.userId) {
      socket.emit("messageError", { error: "Authentication required" });
      return;
    }

    try {
      // Import models dynamically to avoid circular dependency
      const { Message } = require("./src/models/models");

      // Save message to database
      const newMessage = new Message({
        connectionId,
        sender: message.sender,
        content: message.content,
      });
      await newMessage.save();

      // Emit message to all users in the room with the saved message data
      const savedMessage = {
        ...message,
        _id: newMessage._id,
        createdAt: newMessage.createdAt,
      };

      io.to(connectionId).emit("receiveMessage", savedMessage);
      console.log(
        `Message sent to room ${connectionId}:`,
        savedMessage.content
      );
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

// Update app.listen to server.listen
server.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on http://localhost:${PORT}`
  );
});
