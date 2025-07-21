const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fullName: {
    type: String,
    default: "",
    trim: true,
  },
  location: {
    type: String,
    default: "",
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["user", "mentor", "admin"],
    default: "user",
  },
  bio: {
    type: String,
    default: "",
  },
  skills: [
    {
      type: String,
    },
  ],
  interests: [
    {
      type: String,
    },
  ],
  isMentor: {
    type: Boolean,
    default: false,
  },
  mentorshipAreas: [
    {
      type: String,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Reply Schema
const replySchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Post Schema
const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["discussions", "milestones", "q-and-a"],
    required: true,
  },
  replies: [replySchema],
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: String,
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Mentorship Connection Schema
const connectionSchema = new mongoose.Schema({
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Private Message Schema
const messageSchema = new mongoose.Schema({
  connection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Connection",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Reply = mongoose.model("Reply", replySchema);
const Connection = mongoose.model("Connection", connectionSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = {
  User,
  Post,
  Reply,
  Connection,
  Message,
};
