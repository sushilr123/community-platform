# 🌟 Community Platform

A comprehensive, modern community platform that enables users to connect, share knowledge, celebrate milestones, ask questions, and find mentorship opportunities. Built with a focus on user experience, scalability, and maintainability.

## 📋 Table of Contents

- [🚀 Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🌐 API Documentation](#-api-documentation)
- [💾 Database Schema](#-database-schema)
- [🎨 Frontend Architecture](#-frontend-architecture)
- [🔐 Authentication & Security](#-authentication--security)
- [📱 Usage Guide](#-usage-guide)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🚀 Features

### Core Functionality

- **🏠 Community Hub**: Central space for community interactions
- **💬 Discussions**: Start and participate in community conversations
- **🎯 Milestones**: Share and celebrate achievements
- **❓ Q&A System**: Ask questions and get expert answers
- **👥 Mentorship**: Connect with experienced mentors
- **🔍 Search**: Find content across all platform sections
- **👤 User Profiles**: Comprehensive profile management

### User Experience

- **🎨 Modern UI/UX**: Glassmorphism design with smooth animations
- **📱 Responsive Design**: Works seamlessly on all devices
- **🌙 Dark Theme Compatible**: Eye-friendly interface
- **⚡ Real-time Updates**: Dynamic content without page refreshes
- **🎯 Intuitive Navigation**: Icon-based tabs with visual feedback

### Technical Features

- **🔐 JWT Authentication**: Secure token-based authentication
- **👑 Role-based Access**: User, Mentor, and Admin roles
- **📊 Admin Dashboard**: User management and platform analytics
- **💾 MongoDB Integration**: Efficient data storage and retrieval
- **🔄 RESTful API**: Well-structured API endpoints
- **📈 Scalable Architecture**: Production-ready structure

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM (v8.16.4)
- **Authentication**: JSON Web Tokens (JWT) (v9.0.2)
- **Security**: bcryptjs for password hashing (v3.0.2)
- **Session Management**: express-session (v1.18.2)
- **Environment**: dotenv (v17.2.0)
- **CORS**: Cross-Origin Resource Sharing support (v2.8.5)

### Frontend

- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with variables, glassmorphism effects
- **Architecture**: Modular component-based structure
- **Assets**: Organized CSS and JavaScript files

### Development Tools

- **Hot Reload**: nodemon (v3.1.10) for development
- **Package Manager**: npm
- **Version Control**: Git with comprehensive commit history

### Production Ready

- **Deployment**: Docker, PM2, and cloud platform configurations
- **Environment Management**: Separate development and production configs
- **Health Monitoring**: Built-in health check endpoints
- **Error Handling**: Comprehensive error management system

## 📁 Project Structure

```
community-platform/
├── 📁 src/                          # Source code directory
│   ├── 📁 config/                   # Configuration files
│   │   ├── config.js               # Application configuration
│   │   └── database.js             # Database connection setup
│   ├── 📁 middleware/              # Express middleware
│   │   └── auth.js                 # Authentication middleware
│   ├── 📁 models/                  # Database models
│   │   └── models.js               # User, Post, Mentorship schemas
│   ├── 📁 routes/                  # API route handlers
│   │   ├── auth.js                 # Authentication routes
│   │   ├── mentorship.js           # Mentorship routes
│   │   └── routes.js               # Main application routes
│   └── 📁 utils/                   # Utility functions
│       ├── appError.js             # Custom error handling
│       └── errorHandler.js         # Global error middleware
├── 📁 public/                      # Static assets
│   ├── 📁 css/                     # Stylesheets
│   │   ├── auth.css                # Authentication pages styling
│   │   ├── mentorship.css          # Mentorship page styling
│   │   ├── style.css               # Main application styles
│   │   └── style-new.css           # Additional styling
│   └── 📁 js/                      # Client-side JavaScript
│       ├── auth.js                 # Authentication handling
│       ├── mentorship.js           # Mentorship functionality
│       └── script.js               # Main application logic
├── 📁 views/                       # HTML templates
│   ├── index.html                  # Main application page
│   ├── login.html                  # Login page
│   ├── register.html               # Registration page
│   └── mentorship.html             # Mentorship page
├── 📁 scripts/                     # Utility scripts
│   ├── create-test-users.js        # Test user creation
│   ├── debug-mentorship.js         # Mentorship debugging
│   └── seed.js                     # Database seeding
├── 📁 logs/                        # Application logs
├── 📄 server.js                    # Main server file
├── 📄 package.json                 # Dependencies and scripts
├── 📄 .env                         # Environment variables
├── 📄 .env.example                 # Environment template
├── 📄 .gitignore                   # Git ignore rules
├── 📄 ecosystem.config.js          # PM2 configuration
├── 📄 docker-compose.yml           # Docker composition
├── 📄 Dockerfile                   # Docker container setup
├── 📄 healthcheck.js               # Health monitoring
└── 📄 README.md                    # This documentation
```

## ⚙️ Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v7.0 or higher) - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/sushilr123/community-platform.git
cd community-platform
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies:

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.0",
    "express": "^5.1.0",
    "express-session": "^1.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.16.4"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
```

### Step 3: Environment Configuration

1. **Copy the environment template:**

   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your configuration:**

   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/community-platform

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Authentication Configuration (Generate secure secrets)
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   SESSION_SECRET=your-super-secure-session-secret-key-here
   JWT_EXPIRE=7d

   # Security Settings
   BCRYPT_SALT_ROUNDS=12

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Session Configuration
   SESSION_MAX_AGE=86400000
   ```

### Step 4: Database Setup

#### Option A: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:

   ```bash
   # Windows
   net start MongoDB

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. Use local connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/community-platform
   ```

### Step 5: Initialize Database

```bash
# Create test users and sample data
npm run create-users
npm run seed
```

This creates:

- **Admin User**: username: `admin`, password: `admin123`
- **Mentor User**: username: `mentor1`, password: `mentor123`
- **Regular User**: username: `user1`, password: `user123`

### Step 6: Start the Application

#### Development Mode (with hot reload):

```bash
npm run dev
```

#### Production Mode:

```bash
npm start
```

#### Using PM2 (Process Manager):

```bash
npm run pm2:start
```

### Step 7: Access the Application

Open your browser and navigate to:

- **Main Application**: http://localhost:3000
- **Login Page**: http://localhost:3000/login.html
- **Register Page**: http://localhost:3000/register.html
- **Mentorship**: http://localhost:3000/mentorship.html
- **Health Check**: http://localhost:3000/api/health

## 🌐 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user",
  "bio": "Software developer passionate about web technologies",
  "skills": ["JavaScript", "Node.js", "React"],
  "interests": ["AI", "Web Development", "Open Source"]
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

#### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bio": "Updated bio",
  "skills": ["JavaScript", "Python", "Docker"],
  "interests": ["Cloud Computing", "DevOps"]
}
```

### Posts Endpoints

#### Get Posts by Type

```http
GET /api/posts/{type}
# Types: discussions, milestones, q-and-a
```

#### Create Post

```http
POST /api/posts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "This is my first post!",
  "type": "discussions",
  "tags": ["introduction", "community"]
}
```

#### Add Reply to Post

```http
POST /api/posts/{postId}/replies
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Great post! Thanks for sharing."
}
```

#### Like/Unlike Post

```http
POST /api/posts/{postId}/like
Authorization: Bearer <jwt_token>
```

### Mentorship Endpoints

#### Request Mentorship

```http
POST /api/mentorship/request
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "mentorId": "mentor_user_id",
  "message": "I'd love to learn from your experience in web development."
}
```

#### Get Mentorship Connections

```http
GET /api/mentorship/connections
Authorization: Bearer <jwt_token>
```

#### Update Connection Status

```http
PUT /api/mentorship/connections/{connectionId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "accepted"
}
```

### Admin Endpoints

#### Get All Users

```http
GET /api/users
Authorization: Bearer <admin_jwt_token>
```

#### Update User Role

```http
PUT /api/auth/admin/users/{userId}/role
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "role": "mentor"
}
```

## 💾 Database Schema

### User Model

```javascript
{
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'mentor', 'admin'],
    default: 'user'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  isMentor: {
    type: Boolean,
    default: false
  },
  mentorshipAreas: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Post Model

```javascript
{
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['discussions', 'milestones', 'q-and-a']
  },
  replies: [{
    author: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Mentorship Model

```javascript
{
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

## 🎨 Frontend Architecture

### Component Structure

```
Frontend Components:
├── 🏠 Main Application (index.html)
│   ├── Header with Navigation
│   ├── User Dropdown Menu
│   ├── Tab-based Content
│   └── Dynamic Content Loading
├── 🔐 Authentication Pages
│   ├── Login Form (login.html)
│   └── Registration Form (register.html)
└── 👥 Mentorship Interface (mentorship.html)
```

### CSS Architecture

```css
/* CSS Variables for Consistent Theming */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
  --background-color: #f8fafc;
  --text-color: #2d3748;
  --border-radius: 12px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Glassmorphism Effects */
.glass-effect {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--border-radius);
}
```

### JavaScript Modules

```javascript
// Authentication Module (auth.js)
-setAuthToken() -
  getAuthToken() -
  login() -
  register() -
  logout() -
  authenticatedFetch() -
  // Main Application (script.js)
  loadUserProfile() -
  fetchPosts() -
  createPost() -
  addReply() -
  likePost() -
  switchToTab() -
  // Mentorship Module (mentorship.js)
  loadMentorshipData() -
  sendConnectionRequest() -
  updateConnectionStatus() -
  loadMessages();
```

## 🔐 Authentication & Security

### Security Features

- **🔐 JWT Tokens**: Secure authentication with configurable expiration
- **🔑 Password Hashing**: bcrypt with 12 salt rounds
- **🛡️ Input Validation**: Server-side validation for all inputs
- **🚫 SQL Injection Protection**: MongoDB prevents SQL injection
- **🔒 CORS Configuration**: Controlled cross-origin requests
- **👥 Role-based Access**: User, Mentor, Admin role hierarchy
- **⏰ Session Management**: Configurable session timeouts

### Authentication Flow

```mermaid
graph TD
    A[User Login] --> B[Validate Credentials]
    B --> C{Valid?}
    C -->|Yes| D[Generate JWT Token]
    C -->|No| E[Return Error]
    D --> F[Set Session]
    F --> G[Return User Data]
    G --> H[Store Token in localStorage]
    H --> I[Redirect to Dashboard]
```

### Middleware Protection

```javascript
// Protected routes require authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};
```

## 📱 Usage Guide

### For Regular Users

1. **Registration**: Create account with username, email, and password
2. **Profile Setup**: Add bio, skills, and interests
3. **Browse Content**: Explore discussions, milestones, and Q&A
4. **Participate**: Create posts, reply to discussions, like content
5. **Connect**: Find and connect with mentors

### For Mentors

1. **Mentor Setup**: Set role to mentor and add mentorship areas
2. **Accept Mentees**: Review and accept mentorship requests
3. **Guidance**: Provide advice through discussions and direct messages
4. **Community Leadership**: Lead by example in community discussions

### For Administrators

1. **User Management**: View all users, update roles, manage accounts
2. **Content Moderation**: Monitor posts and discussions
3. **Platform Analytics**: View platform statistics and metrics
4. **System Health**: Monitor application performance

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### PM2 Process Manager

```bash
# Start with PM2
npm run pm2:start

# Monitor processes
npm run pm2:logs

# Stop processes
npm run pm2:stop
```

### Cloud Platforms

#### Render.com

1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

#### Railway.app

1. Connect repository
2. Railway auto-detects Node.js
3. Add environment variables
4. Deploy automatically

#### Heroku

1. Create Heroku app
2. Set buildpacks: `heroku/nodejs`
3. Add environment variables
4. Deploy with Git

### Environment Variables for Production

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://production-connection-string
JWT_SECRET=super-secure-production-jwt-secret
SESSION_SECRET=super-secure-production-session-secret
CORS_ORIGIN=https://yourdomain.com
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Profile creation and editing
- [ ] Post creation across all types
- [ ] Reply functionality
- [ ] Like/unlike features
- [ ] Mentorship request flow
- [ ] Admin panel functionality
- [ ] API endpoint responses
- [ ] Authentication middleware
- [ ] Error handling

### Test Users

After running `npm run create-users`:

- **Admin**: username: `admin`, password: `admin123`
- **Mentor**: username: `mentor1`, password: `mentor123`
- **User**: username: `user1`, password: `user123`

### API Testing with cURL

```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow coding standards
4. **Test thoroughly**: Ensure all functionality works
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**: Describe changes and impact

### Coding Standards

- Use consistent indentation (2 spaces)
- Follow JavaScript ES6+ standards
- Add comments for complex logic
- Use meaningful variable names
- Keep functions small and focused

### Issue Reporting

When reporting issues, include:

- Environment details (OS, Node.js version)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors if any

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by community-driven platforms
- Designed for scalability and maintainability
- Created for educational and practical use

## 📞 Support

If you need help or have questions:

- Open an issue on GitHub
- Check the documentation
- Review the API endpoints
- Test with provided test users

---

**Happy coding! 🎉** Built with ❤️ for the developer community.
