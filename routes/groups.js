const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { protect, isGroupAdmin } = require('../middleware/auth');

// Create new group
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id] // Add creator as member
    });

    // Add group to creator's groups array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { groups: group._id }
    });

    res.status(201).json({
      status: 'success',
      data: {
        group
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get all groups
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('creator', 'username profilePicture')
      .populate('members', 'username profilePicture');

    res.status(200).json({
      status: 'success',
      results: groups.length,
      data: {
        groups
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get user's groups
router.get('/my-groups', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'groups',
        populate: [
          { path: 'creator', select: 'username profilePicture' },
          { path: 'members', select: 'username profilePicture' }
        ]
      });

    res.status(200).json({
      status: 'success',
      results: user.groups.length,
      data: {
        groups: user.groups
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get single group
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'username profilePicture')
      .populate('members', 'username profilePicture')
      .populate('posts');

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Group not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        group
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get user's friends for group member addition
router.get('/:id/friends', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username profilePicture email');
    
    // Filter out friends who are already members of the group
    const group = await Group.findById(req.params.id);
    const existingMemberIds = group.members.map(member => member.toString());
    
    const availableFriends = user.friends.filter(
      friend => !existingMemberIds.includes(friend._id.toString())
    );

    res.status(200).json({
      status: 'success',
      data: {
        friends: availableFriends
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add member to group
router.post('/:id/members', protect, isGroupAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user is a friend
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.friends.includes(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Can only add friends to the group'
      });
    }

    const group = await Group.findById(req.params.id);

    if (group.members.includes(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a member of this group'
      });
    }

    // Add user to group members
    group.members.push(userId);
    await group.save();

    // Add group to user's groups array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { groups: group._id }
    });

    res.status(200).json({
      status: 'success',
      data: {
        group
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Remove member from group
router.delete('/:id/members/:memberId', protect, isGroupAdmin, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group.members.includes(req.params.memberId)) {
      return res.status(400).json({
        status: 'error',
        message: 'User is not a member of this group'
      });
    }

    if (req.params.memberId === group.creator.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot remove the group creator'
      });
    }

    group.members = group.members.filter(
      memberId => memberId.toString() !== req.params.memberId
    );
    await group.save();

    res.status(200).json({
      status: 'success',
      data: {
        group
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update group
router.patch('/:id', protect, isGroupAdmin, async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Group not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        group
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete group
router.delete('/:id', protect, isGroupAdmin, async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({
        status: 'error',
        message: 'Group not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 