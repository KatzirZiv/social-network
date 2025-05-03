const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
};

// Check if user is admin
exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to perform this action'
      });
    }
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
};

// Check if user is group admin
exports.isGroupAdmin = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to perform this action'
      });
    }
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
}; 