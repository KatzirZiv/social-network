const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');

// Get platform analytics (admin only)
router.get('/platform', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view platform analytics'
      });
    }

    const [
      totalUsers,
      totalGroups,
      totalPosts,
      activeUsers,
      popularGroups
    ] = await Promise.all([
      User.countDocuments(),
      Group.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Group.find().sort({ members: -1 }).limit(5).select('name members')
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalGroups,
        totalPosts,
        activeUsers,
        popularGroups
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get user analytics
router.get('/user', protect, async (req, res) => {
  try {
    const [
      userPosts,
      userGroups,
      userComments,
      userLikes
    ] = await Promise.all([
      Post.countDocuments({ author: req.user.id }),
      Group.countDocuments({ members: req.user.id }),
      Post.countDocuments({ 'comments.author': req.user.id }),
      Post.countDocuments({ likes: req.user.id })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        posts: userPosts,
        groups: userGroups,
        comments: userComments,
        likes: userLikes
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get group analytics
router.get('/group/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || !group.members.includes(req.user.id)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view group analytics'
      });
    }

    const [
      totalPosts,
      totalMembers,
      activeMembers,
      recentPosts
    ] = await Promise.all([
      Post.countDocuments({ group: req.params.groupId }),
      Group.findById(req.params.groupId).select('members'),
      User.countDocuments({
        _id: { $in: group.members },
        lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Post.find({ group: req.params.groupId })
        .sort('-createdAt')
        .limit(5)
        .populate('author', 'username')
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalPosts,
        totalMembers: totalMembers.members.length,
        activeMembers,
        recentPosts
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 