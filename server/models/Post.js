const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: true });

const postSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  media: { 
    type: String,
    trim: true
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
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [commentSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Ensure likes are unique
postSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likes = [...new Set(this.likes)];
  }
  next();
});

module.exports = mongoose.model('Post', postSchema); 