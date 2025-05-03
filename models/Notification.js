const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['new_post', 'new_comment', 'group_join', 'message', 'like', 'mention'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  entityType: {
    type: String,
    enum: ['post', 'comment', 'group', 'message'],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 