const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Create a new post
router.post('/', postController.createPost);

// Get all posts
router.get('/', postController.getPosts);

// Like/unlike a post
router.post('/:id/likes', postController.likePost);

// Add a comment to a post
router.post('/:id/comments', postController.addComment);

module.exports = router; 