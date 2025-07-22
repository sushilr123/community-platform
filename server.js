const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");

// Import configuration and utilities
const config = require("./src/config/config");
const connectDB = require("./src/config/database");
const globalErrorHandler = require("./src/utils/errorHandler");
const AppError = require("./src/utils/appError");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === "production",
      maxAge: config.SESSION_MAX_AGE,
      httpOnly: true,
    },
  })
);

// Routes
const authRoutes = require("./src/routes/auth");
const postRoutes = require("./src/routes/routes");
const mentorshipRoutes = require("./src/routes/mentorship");

app.use("/api/auth", authRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api", postRoutes);

// Serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

const server = app.listen(config.PORT, () => {
  console.log(
    `🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
  );
});
