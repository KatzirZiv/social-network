const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure creator is always an admin and member
groupSchema.pre('save', function(next) {
  if (this.isNew) {
    // Convert creator to string for comparison
    const creatorId = this.creator.toString();
    
    // Ensure creator is in admins array
    if (!this.admins.some(admin => admin.toString() === creatorId)) {
      this.admins.push(this.creator);
    }
    
    // Ensure creator is in members array
    if (!this.members.some(member => member.toString() === creatorId)) {
      this.members.push(this.creator);
    }
  }
  next();
});

// Ensure admins are always members
groupSchema.pre('save', function(next) {
  if (this.isModified('admins')) {
    this.admins.forEach(admin => {
      const adminId = admin.toString();
      if (!this.members.some(member => member.toString() === adminId)) {
        this.members.push(admin);
      }
    });
  }
  next();
});

// Ensure unique members and admins
groupSchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.members = [...new Set(this.members.map(member => member.toString()))]
      .map(id => mongoose.Types.ObjectId(id));
  }
  if (this.isModified('admins')) {
    this.admins = [...new Set(this.admins.map(admin => admin.toString()))]
      .map(id => mongoose.Types.ObjectId(id));
  }
  next();
});

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group; 