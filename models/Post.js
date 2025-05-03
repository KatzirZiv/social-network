const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [1000, 'Post content cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  image: {
    type: String,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ likes: 1 });

// Add post to user's posts array
postSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(doc.author, {
    $push: { posts: doc._id }
  });
});

// Add post to group's posts array if it's a group post
postSchema.post('save', async function(doc) {
  if (doc.group) {
    const Group = mongoose.model('Group');
    await Group.findByIdAndUpdate(doc.group, {
      $push: { posts: doc._id }
    });
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 