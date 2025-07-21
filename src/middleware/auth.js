const jwt = require("jsonwebtoken");
const { User } = require("../models/models");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  console.log("Auth middleware - Header:", authHeader ? "Present" : "Missing");
  console.log("Auth middleware - Token:", token ? "Present" : "Missing");

  if (!token) {
    console.log("Auth middleware - No token provided");
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Auth middleware - Token decoded for user:", decoded.userId);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      console.log(
        "Auth middleware - Invalid or inactive user:",
        decoded.userId
      );
      return res.status(401).json({ message: "Invalid or inactive user" });
    }

    console.log("Auth middleware - User authenticated:", {
      id: user._id,
      username: user.username,
      role: user.role,
      isMentor: user.isMentor,
    });

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth middleware - Token verification failed:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check user role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(
          ", "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Middleware for admin only
const adminOnly = authorizeRole("admin");

// Middleware for mentor and admin
const mentorOrAdmin = authorizeRole("mentor", "admin");

// Middleware for authenticated users (any role)
const authenticatedUser = authenticateToken;

module.exports = {
  authenticateToken,
  authorizeRole,
  adminOnly,
  mentorOrAdmin,
  authenticatedUser,
};
