const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
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

app.use("/api/auth", authRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api", postRoutes);

// Serve the frontend
app.get("/*", (req, res) => {
  // Check if the request is for an API route
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found" });
  }

  // Determine the file path, defaulting to index.html
  let fileName = req.path;
  if (fileName === "/") {
    fileName = "index.html";
  }

  const filePath = path.join(__dirname, "views", fileName);

  // Send the requested file, or index.html for SPA fallback
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, "views", "index.html"));
    }
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on http://localhost:${PORT}`
  );
});
