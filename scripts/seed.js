require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Group = require('../models/Group');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-network', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample data
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    bio: 'System Administrator',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    role: 'admin'
  },
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Software Developer',
    profilePicture: 'https://i.pravatar.cc/150?img=2'
  },
  {
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'UX Designer',
    profilePicture: 'https://i.pravatar.cc/150?img=3'
  },
  {
    username: 'bobsmith',
    email: 'bob@example.com',
    password: 'password123',
    bio: 'Product Manager',
    profilePicture: 'https://i.pravatar.cc/150?img=4'
  },
  {
    username: 'alicejones',
    email: 'alice@example.com',
    password: 'password123',
    bio: 'Data Scientist',
    profilePicture: 'https://i.pravatar.cc/150?img=5'
  }
];

const groups = [
  {
    name: 'Web Development',
    description: 'A group for web developers to share knowledge and resources',
    admin: null, // Will be set after user creation
    members: [], // Will be populated after user creation
    posts: [] // Will be populated after post creation
  },
  {
    name: 'UI/UX Design',
    description: 'A community for designers to share their work and get feedback',
    admin: null,
    members: [],
    posts: []
  },
  {
    name: 'Data Science',
    description: 'A group for data scientists and machine learning enthusiasts',
    admin: null,
    members: [],
    posts: []
  }
];

const posts = [
  {
    author: null, // Will be set after user creation
    group: null, // Will be set after group creation
    content: 'Just learned about React Hooks! They make state management so much easier.',
    media: 'https://example.com/react-hooks.jpg',
    likes: [],
    comments: []
  },
  {
    author: null,
    group: null,
    content: 'Check out this amazing UI design I created! @janedoe',
    media: 'https://example.com/ui-design.jpg',
    likes: [],
    comments: []
  },
  {
    author: null,
    group: null,
    content: 'New machine learning algorithm breakthrough!',
    media: 'https://example.com/ml-algorithm.jpg',
    likes: [],
    comments: []
  }
];

const comments = [
  {
    author: null,
    content: 'Great post! I completely agree with your points.',
    post: null
  },
  {
    author: null,
    content: 'Thanks for sharing this! Very informative.',
    post: null
  },
  {
    author: null,
    content: 'I have a question about the implementation...',
    post: null
  }
];

const messages = [
  {
    sender: null,
    receiver: null,
    content: 'Hey, how are you doing?',
    timestamp: new Date()
  },
  {
    sender: null,
    receiver: null,
    content: 'I\'m good, thanks! How about you?',
    timestamp: new Date()
  },
  {
    sender: null,
    receiver: null,
    content: 'Do you want to collaborate on a project?',
    timestamp: new Date()
  }
];

// Seed function
const seed = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Group.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Message.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({
          ...user,
          password: hashedPassword
        });
      })
    );

    console.log('Created users');

    // Create groups
    const createdGroups = await Promise.all(
      groups.map((group, index) => {
        const admin = createdUsers[0]._id; // First user is admin
        const members = createdUsers.slice(1).map(user => user._id);
        return Group.create({
          ...group,
          admin,
          members
        });
      })
    );

    console.log('Created groups');

    // Create posts
    const createdPosts = await Promise.all(
      posts.map((post, index) => {
        const author = createdUsers[index % createdUsers.length]._id;
        const group = createdGroups[index % createdGroups.length]._id;
        return Post.create({
          ...post,
          author,
          group
        });
      })
    );

    console.log('Created posts');

    // Create comments
    const createdComments = await Promise.all(
      comments.map((comment, index) => {
        const author = createdUsers[index % createdUsers.length]._id;
        const post = createdPosts[index % createdPosts.length]._id;
        return Comment.create({
          ...comment,
          author,
          post
        });
      })
    );

    console.log('Created comments');

    // Create messages
    const createdMessages = await Promise.all(
      messages.map((message, index) => {
        const sender = createdUsers[index % createdUsers.length]._id;
        const receiver = createdUsers[(index + 1) % createdUsers.length]._id;
        return Message.create({
          ...message,
          sender,
          receiver
        });
      })
    );

    console.log('Created messages');

    // Update posts with comments
    await Promise.all(
      createdPosts.map(async (post, index) => {
        const comment = createdComments[index % createdComments.length];
        post.comments.push(comment._id);
        await post.save();
      })
    );

    console.log('Updated posts with comments');

    // Update groups with posts
    await Promise.all(
      createdGroups.map(async (group, index) => {
        const post = createdPosts[index % createdPosts.length];
        group.posts.push(post._id);
        await group.save();
      })
    );

    console.log('Updated groups with posts');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      bio: 'System Administrator',
      profilePicture: 'https://i.pravatar.cc/150?img=1',
      isAdmin: true
    });

    console.log('Admin user created successfully:', admin);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

seed();
createAdmin(); 