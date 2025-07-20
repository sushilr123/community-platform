# Community Platform

A modern, lightweight community space where users can interact, ask questions, share milestones, and connect with mentors.

## Features

- **Modern UI/UX**: Beautiful, responsive design with glassmorphism effects and smooth animations
- **Dropdown Navigation**: Sleek user menu with profile access and quick actions
- **Enhanced Navigation**: Icon-based tab system with hover effects and active states
- **Discussions**: Start conversations and engage with the community
- **Milestones**: Share achievements and celebrate success
- **Q&A**: Ask questions and get help from peers
- **Mentorship**: Connect with experienced mentors in your field
- **User Profiles**: Complete profile management with edit functionality
- **Threaded Replies**: Engage in detailed discussions with nested replies
- **Like System**: Show appreciation for helpful posts
- **Real-time Updates**: Dynamic content loading from the database
- **Three-Level Authentication**: User, Mentor, and Admin roles with proper access control
- **Admin Panel**: Comprehensive user management and platform statistics

## Technology Stack

- **Frontend**: HTML5, CSS3 (Modern features like glassmorphism, CSS variables), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcryptjs password hashing
- **Environment**: dotenv for configuration
- **UI/UX**: Modern responsive design with animations and transitions

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Install missing dependencies**

   ```bash
   npm install cors nodemon
   ```

3. **Set up environment variables**

   The `.env` file is already created with default values:

   ```
   MONGODB_URI=mongodb://localhost:27017/community-platform
   PORT=3000
   NODE_ENV=development
   ```

   Update the `MONGODB_URI` if you're using MongoDB Atlas or a different connection string.

4. **Start MongoDB**

   If using local MongoDB:

   ```bash
   mongod
   ```

   If using MongoDB Atlas, ensure your connection string is correct in the `.env` file.

5. **Seed the database with sample data**

   ```bash
   npm run seed
   ```

6. **Start the server**

   For development (with auto-restart):

   ```bash
   npm run dev
   ```

   For production:

   ```bash
   npm start
   ```

7. **Access the application**

   Open your browser and go to: `http://localhost:3000`

## API Endpoints

### Posts

- `GET /api/posts/:type` - Get all posts by type (discussions, milestones, q-and-a)
- `POST /api/posts` - Create a new post
- `POST /api/posts/:id/replies` - Add a reply to a post
- `POST /api/posts/:id/like` - Like/unlike a post

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/mentors` - Get all mentors

### Mentorship

- `POST /api/mentorship` - Create a mentorship connection
- `GET /api/mentorship/:username` - Get mentorship connections for a user
- `PUT /api/mentorship/:id` - Update mentorship status

### Search

- `GET /api/search?q=query&type=type` - Search posts

## Database Schema

### User

- username (String, unique)
- email (String, unique)
- bio (String)
- skills (Array of Strings)
- interests (Array of Strings)
- isMentor (Boolean)
- mentorshipAreas (Array of Strings)
- createdAt (Date)

### Post

- author (String)
- content (String)
- type (String: discussions, milestones, q-and-a)
- replies (Array of Reply objects)
- likes (Number)
- likedBy (Array of Strings)
- tags (Array of Strings)
- createdAt (Date)
- updatedAt (Date)

### Mentorship

- mentor (String)
- mentee (String)
- status (String: pending, accepted, rejected)
- message (String)
- createdAt (Date)

## Project Structure

```
community-platform/
├── models/
│   └── models.js          # Database schemas
├── routes/
│   └── routes.js          # API routes
├── index.html             # Frontend HTML
├── script.js              # Frontend JavaScript
├── style.css              # Frontend styles
├── server.js              # Express server
├── seed.js                # Database seeding script
├── .env                   # Environment variables
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

ISC License
