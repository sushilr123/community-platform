const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User, Post, Mentorship } = require("./models/models");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/community-platform",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Mentorship.deleteMany({});

    // Hash password for all users
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create sample users
    const users = [
      {
        username: "Alice",
        email: "alice@example.com",
        password: hashedPassword,
        role: "mentor",
        bio: "Full-stack developer with 5 years of experience",
        skills: ["JavaScript", "React", "Node.js"],
        interests: ["Web Development", "AI"],
        isMentor: true,
        mentorshipAreas: ["React", "JavaScript", "Career Development"],
      },
      {
        username: "Bob",
        email: "bob@example.com",
        password: hashedPassword,
        role: "mentor",
        bio: "DevOps engineer passionate about cloud technologies",
        skills: ["Docker", "Kubernetes", "AWS"],
        interests: ["Cloud Computing", "DevOps"],
        isMentor: true,
        mentorshipAreas: ["DevOps", "Cloud Architecture", "Docker"],
      },
      {
        username: "Charlie",
        email: "charlie@example.com",
        password: hashedPassword,
        role: "mentor",
        bio: "Product manager with startup experience",
        skills: ["Product Management", "User Research"],
        interests: ["Startups", "Product Strategy"],
        isMentor: true,
        mentorshipAreas: ["Product Management", "Startup Strategy"],
      },
      {
        username: "David",
        email: "david@example.com",
        password: hashedPassword,
        role: "user",
        bio: "Junior developer eager to learn",
        skills: ["HTML", "CSS", "Python"],
        interests: ["Web Development", "Machine Learning"],
        isMentor: false,
        mentorshipAreas: [],
      },
      {
        username: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        bio: "Platform administrator",
        skills: ["Administration", "Community Management"],
        interests: ["Platform Management"],
        isMentor: false,
        mentorshipAreas: [],
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("✅ Users created successfully");

    // Create sample posts
    const posts = [
      {
        author: "Alice",
        content:
          "Welcome to our new community platform! This is a place where we can share knowledge, celebrate milestones, and support each other.",
        type: "discussions",
        replies: [
          {
            author: "Bob",
            content:
              "Great initiative! Looking forward to being part of this community.",
          },
        ],
        likes: 5,
        likedBy: ["Bob", "Charlie", "David"],
        tags: ["welcome", "community"],
      },
      {
        author: "Bob",
        content:
          "Has anyone worked with Kubernetes in production? I'm looking for best practices for deployment strategies.",
        type: "discussions",
        replies: [
          {
            author: "Alice",
            content:
              "I have! Blue-green deployments work really well. Happy to share more details.",
          },
        ],
        likes: 3,
        likedBy: ["Alice", "Charlie"],
        tags: ["kubernetes", "devops", "deployment"],
      },
      {
        author: "Charlie",
        content:
          "Just launched my first SaaS product! 🎉 It took 6 months of hard work, but we finally have our first 100 users.",
        type: "milestones",
        replies: [
          {
            author: "Alice",
            content:
              "Congratulations! That's a huge milestone. What was the biggest challenge?",
          },
          {
            author: "David",
            content: "Amazing! Would love to hear about your journey.",
          },
        ],
        likes: 8,
        likedBy: ["Alice", "Bob", "David"],
        tags: ["startup", "saas", "milestone"],
      },
      {
        author: "David",
        content:
          "I'm new to React and struggling with state management. Should I start with useState or jump straight to Redux?",
        type: "q-and-a",
        replies: [
          {
            author: "Alice",
            content:
              "Start with useState and useContext for simple state. Redux is great for complex apps but might be overkill initially.",
          },
        ],
        likes: 2,
        likedBy: ["Alice", "Charlie"],
        tags: ["react", "state-management", "beginner"],
      },
      {
        author: "Alice",
        content:
          "Just completed my AWS Solutions Architect certification! 📜 The exam was challenging but totally worth it.",
        type: "milestones",
        replies: [],
        likes: 6,
        likedBy: ["Bob", "Charlie", "David"],
        tags: ["aws", "certification", "achievement"],
      },
      {
        author: "David",
        content:
          "What are the best resources for learning machine learning as a web developer?",
        type: "q-and-a",
        replies: [
          {
            author: "Bob",
            content:
              "Andrew Ng's course on Coursera is excellent for beginners. Also check out fast.ai for practical approaches.",
          },
        ],
        likes: 4,
        likedBy: ["Bob", "Charlie"],
        tags: ["machine-learning", "resources", "learning"],
      },
    ];

    const createdPosts = await Post.insertMany(posts);
    console.log("✅ Posts created successfully");

    // Create sample mentorship connections
    const mentorships = [
      {
        mentor: "Alice",
        mentee: "David",
        status: "accepted",
        message:
          "Hi Alice! I'd love to learn more about React development from you.",
      },
      {
        mentor: "Bob",
        mentee: "David",
        status: "pending",
        message:
          "Hi Bob! I'm interested in learning DevOps practices. Could you mentor me?",
      },
    ];

    const createdMentorships = await Mentorship.insertMany(mentorships);
    console.log("✅ Mentorship connections created successfully");

    console.log("\n🎉 Database seeded successfully!");
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${createdPosts.length} posts`);
    console.log(`Created ${createdMentorships.length} mentorship connections`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
