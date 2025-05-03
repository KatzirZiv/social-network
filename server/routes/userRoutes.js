const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get user's friends
router.get('/friends', userController.getFriends);

// Add a friend
router.post('/friends/:id', userController.addFriend);

// Remove a friend
router.delete('/friends/:id', userController.removeFriend);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

module.exports = router; 