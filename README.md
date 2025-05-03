# Social Network Platform

A full-stack social network platform built with Node.js, Express, MongoDB, and React, featuring real-time communication and group management.

## Features

- User authentication and authorization with JWT
- Real-time chat using Socket.IO
- Group creation and management
- Posts with media support
- Comments and likes
- Real-time notifications
- User search functionality
- Responsive design with CSS3

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT for authentication
- Cloudinary for media storage
- Multer for file uploads

### Frontend
- React.js
- Socket.IO Client
- CSS3 for styling
- Axios for API calls

## Project Structure

```
social-network/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── context/       # React context
│       ├── hooks/         # Custom hooks
│       └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js         # Main server file
├── .env                  # Environment variables
└── package.json          # Project dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Cloudinary account (for media storage)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/katzirziv/social-network.git
cd social-network
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-network
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:3000
```

5. Start the development servers:
```bash
# Start both frontend and backend in development mode
npm run dev:full

# Or start them separately:
# Terminal 1 (Backend):
npm run dev

# Terminal 2 (Frontend):
npm run client
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Groups
- `POST /api/groups` - Create new group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `PATCH /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Add comment

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send message
- `GET /api/messages/:id` - Get message by ID
- `DELETE /api/messages/:id` - Delete message

### Notifications
- `GET /api/notifications` - Get all notifications
- `PATCH /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## Development

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test
```

### Database Seeding
```bash
npm run seed
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 