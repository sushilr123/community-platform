// Test script to create mentor and user accounts
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("../src/models/models");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/community-platform");

async function createTestUsers() {
  try {
    // Create a mentor account
    const mentorPassword = await bcrypt.hash("mentor123", 10);
    const mentor = new User({
      username: "mentor1",
      email: "mentor@test.com",
      password: mentorPassword,
      role: "mentor",
      isMentor: true,
      fullName: "John Mentor",
      bio: "Experienced software developer",
      mentorshipAreas: ["JavaScript", "React", "Node.js"],
      skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    });

    // Create a regular user account
    const userPassword = await bcrypt.hash("user123", 10);
    const user = new User({
      username: "user1",
      email: "user@test.com",
      password: userPassword,
      role: "user",
      fullName: "Jane User",
      bio: "Learning web development",
      skills: ["HTML", "CSS", "JavaScript"],
    });

    // Save users (will skip if they already exist due to unique constraints)
    try {
      await mentor.save();
      console.log("Mentor account created:", mentor.username);
    } catch (error) {
      if (error.code === 11000) {
        console.log("Mentor account already exists");
      }
    }

    try {
      await user.save();
      console.log("User account created:", user.username);
    } catch (error) {
      if (error.code === 11000) {
        console.log("User account already exists");
      }
    }

    console.log("\nTest accounts:");
    console.log("Mentor - username: mentor1, password: mentor123");
    console.log("User - username: user1, password: user123");
  } catch (error) {
    console.error("Error creating test users:", error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUsers();
