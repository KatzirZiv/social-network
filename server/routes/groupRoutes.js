const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new group
router.post('/', groupController.createGroup);

// Get all groups
router.get('/', groupController.getGroups);

// Get user's groups
router.get('/my-groups', groupController.getUserGroups);

// Join a group
router.post('/:id/join', groupController.joinGroup);

// Delete a group
router.delete('/:id', groupController.deleteGroup);

module.exports = router; 