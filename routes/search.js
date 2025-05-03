const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

// Search for users and groups
router.get('/', async (req, res) => {
  try {
    const { q: query, type = 'users' } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long',
        data: { results: [] }
      });
    }

    let results = [];
    const searchRegex = new RegExp(query, 'i');

    if (type === 'users') {
      results = await User.find({
        $or: [
          { username: searchRegex },
          { fullName: searchRegex },
          { bio: searchRegex }
        ]
      }).select('username fullName bio profilePicture').limit(10);
    } else if (type === 'groups') {
      results = await Group.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }).select('name description image').limit(10);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid search type. Must be either "users" or "groups"',
        data: { results: [] }
      });
    }

    res.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: { results }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while performing the search',
      data: { results: [] }
    });
  }
});

module.exports = router; 