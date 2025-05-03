const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [50, 'Group name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent self-adding to members array
groupSchema.pre('save', function(next) {
  if (this.isModified('members')) {
    const creatorIndex = this.members.indexOf(this.creator);
    if (creatorIndex !== -1) {
      this.members.splice(creatorIndex, 1);
    }
  }
  next();
});

// Add group to creator's groups array
groupSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(doc.creator, {
    $push: { groups: doc._id }
  });
});

// Add group to members' groups array
groupSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  await User.updateMany(
    { _id: { $in: doc.members } },
    { $addToSet: { groups: doc._id } }
  );
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group; 