const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');

const users = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Software developer and tech enthusiast',
    profilePicture: 'https://example.com/john.jpg'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'Digital marketer and content creator',
    profilePicture: 'https://example.com/jane.jpg'
  },
  {
    username: 'mike_wilson',
    email: 'mike@example.com',
    password: 'password123',
    bio: 'Photographer and travel blogger',
    profilePicture: 'https://example.com/mike.jpg'
  }
];

const groups = [
  {
    name: 'Tech Enthusiasts',
    description: 'A group for technology lovers and developers',
    admin: null, // Will be set after user creation
    members: [] // Will be populated after user creation
  },
  {
    name: 'Photography Club',
    description: 'Share your photos and learn from others',
    admin: null, // Will be set after user creation
    members: [] // Will be populated after user creation
  },
  {
    name: 'Digital Marketing',
    description: 'Discuss digital marketing strategies and trends',
    admin: null, // Will be set after user creation
    members: [] // Will be populated after user creation
  }
];

const posts = [
  {
    author: null, // Will be set after user creation
    group: null, // Will be set after group creation
    content: 'Just released my new app! Check it out at example.com',
    media: 'https://example.com/app-screenshot.jpg',
    likes: 0
  },
  {
    author: null, // Will be set after user creation
    group: null, // Will be set after group creation
    content: 'Beautiful sunset from my recent trip to Bali',
    media: 'https://example.com/sunset.jpg',
    likes: 0
  },
  {
    author: null, // Will be set after user creation
    group: null, // Will be set after group creation
    content: 'New marketing strategy that increased our conversion rate by 50%',
    media: null,
    likes: 0
  }
];

const comments = [
  {
    author: null, // Will be set after user creation
    content: 'Great work! The UI looks amazing.'
  },
  {
    author: null, // Will be set after user creation
    content: 'Stunning photo! What camera did you use?'
  },
  {
    author: null, // Will be set after user creation
    content: 'Very insightful post. Thanks for sharing!'
  }
];

const messages = [
  {
    sender: null, // Will be set after user creation
    receiver: null, // Will be set after user creation
    content: 'Hey, how are you doing?',
    read: false
  },
  {
    sender: null, // Will be set after user creation
    receiver: null, // Will be set after user creation
    content: 'I\'m good, thanks! How about you?',
    read: false
  },
  {
    sender: null, // Will be set after user creation
    receiver: null, // Will be set after user creation
    content: 'Do you want to join our group meeting tomorrow?',
    read: false
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Group.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Message.deleteMany({});

    // Create users
    const createdUsers = await User.create(users);

    // Update groups with admin and members
    const updatedGroups = groups.map((group, index) => ({
      ...group,
      admin: createdUsers[index]._id,
      members: [createdUsers[index]._id]
    }));
    const createdGroups = await Group.create(updatedGroups);

    // Update posts with author and group
    const updatedPosts = posts.map((post, index) => ({
      ...post,
      author: createdUsers[index]._id,
      group: createdGroups[index]._id
    }));
    const createdPosts = await Post.create(updatedPosts);

    // Update comments with author
    const updatedComments = comments.map((comment, index) => ({
      ...comment,
      author: createdUsers[index]._id
    }));
    const createdComments = await Comment.create(updatedComments);

    // Update messages with sender and receiver
    const updatedMessages = messages.map((message, index) => ({
      ...message,
      sender: createdUsers[index]._id,
      receiver: createdUsers[(index + 1) % createdUsers.length]._id
    }));
    await Message.create(updatedMessages);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase; 