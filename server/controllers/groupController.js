const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const creatorId = req.user._id;

    // Create new group with creator as both admin and member
    const group = new Group({
      name,
      description,
      isPrivate,
      creator: creatorId,
      admins: [creatorId],
      members: [creatorId]
    });

    // Save the group
    await group.save();

    // Populate the group with creator and members details
    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'username profilePicture')
      .populate('members', 'username profilePicture')
      .populate('admins', 'username profilePicture');

    res.status(201).json({
      message: 'Group created successfully',
      data: { group: populatedGroup }
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(400).json({ message: error.message || 'Failed to create group' });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('creator', 'username profilePicture')
      .populate('members', 'username profilePicture')
      .populate('admins', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Groups retrieved successfully',
      data: { groups }
    });
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(400).json({ message: error.message || 'Failed to get groups' });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate('creator', 'username profilePicture')
      .populate('members', 'username profilePicture')
      .populate('admins', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      message: 'User groups retrieved successfully',
      data: { groups }
    });
  } catch (error) {
    console.error('Error getting user groups:', error);
    res.status(400).json({ message: error.message || 'Failed to get user groups' });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    // Add user to members array
    group.members.push(userId);
    await group.save();

    // Get updated group with populated data
    const updatedGroup = await Group.findById(groupId)
      .populate('creator', 'username profilePicture')
      .populate('members', 'username profilePicture')
      .populate('admins', 'username profilePicture');

    res.json({
      message: 'Successfully joined group',
      data: { group: updatedGroup }
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(400).json({ message: error.message || 'Failed to join group' });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is an admin
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: 'Only admins can delete the group' });
    }

    await Group.findByIdAndDelete(groupId);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(400).json({ message: error.message || 'Failed to delete group' });
  }
}; 