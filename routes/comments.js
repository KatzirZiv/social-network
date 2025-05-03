const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const Group = require('../models/Group');

// Create new comment
router.post('/', protect, async (req, res) => {
  try {
    const { content, postId } = req.body;

    // Check if post exists and user is a member of the group
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const group = await Group.findById(post.group);
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      post: postId,
    });

    await comment.save();

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/post/:postId', protect, async (req, res) => {
  try {
    const { postId } = req.params;
    const { skip = 0, limit = 10 } = req.query;

    // Check if post exists and user is a member of the group
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const group = await Group.findById(post.group);
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('author', 'username profilePicture')
      .populate('likes', 'username profilePicture');

    const total = await Comment.countDocuments({ post: postId });

    res.json({
      comments,
      total,
      hasMore: total > parseInt(skip) + parseInt(limit),
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single comment
router.get('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('likes', 'username profilePicture');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is a member of the group
    const post = await Post.findById(comment.post);
    const group = await Group.findById(post.group);
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.patch('/:id', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }

    comment.content = content || comment.content;
    comment.updatedAt = Date.now();

    await comment.save();
    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    // Remove comment from post
    const post = await Post.findById(comment.post);
    post.comments = post.comments.filter(
      commentId => commentId.toString() !== comment._id.toString()
    );
    await post.save();

    await comment.remove();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a comment
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is a member of the group
    const post = await Post.findById(comment.post);
    const group = await Group.findById(post.group);
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const likeIndex = comment.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      comment.likes.push(req.user.id);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 