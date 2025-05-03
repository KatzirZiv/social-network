const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

// Create new post
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const image = req.file ? req.file.path : null;

    // If posting to a group, verify membership
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          status: 'error',
          message: 'Group not found'
        });
      }

      // Check if user is a member of the group
      const isMember = group.members.some(member => member.toString() === req.user.id);
      if (!isMember) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to post in this group'
        });
      }
    }

    const post = await Post.create({
      content,
      author: req.user.id,
      group: groupId || null,
      image
    });

    // Populate author and group details
    await post.populate('author', 'username profilePicture');
    if (groupId) {
      await post.populate('group', 'name');
    }

    res.status(201).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get all posts (including group posts and friends' posts)
router.get('/', protect, async (req, res) => {
  try {
    // Get user's friends and groups
    const user = await User.findById(req.user.id)
      .select('friends groups')
      .populate('groups');

    // Get posts from:
    // 1. User's own posts
    // 2. Posts from groups user is a member of
    // 3. Posts from friends (non-group posts only)
    const posts = await Post.find({
      $or: [
        { author: req.user.id },
        { group: { $in: user.groups } },
        { 
          $and: [
            { author: { $in: user.friends } },
            { group: null }
          ]
        }
      ]
    })
      .populate('author', 'username profilePicture')
      .populate('group', 'name')
      .populate('likes', 'username profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get user's posts
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.params.userId,
      group: null
    })
      .populate('author', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get group posts
router.get('/group/:groupId', protect, async (req, res) => {
  try {
    const posts = await Post.find({
      group: req.params.groupId
    })
      .populate('author', 'username profilePicture')
      .populate('group', 'name')
      .populate('likes', 'username profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get single post
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('group', 'name')
      .populate('likes', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Like/Unlike post
router.patch('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    // Populate likes after update
    await post.populate('likes', 'username profilePicture');

    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update post
router.patch('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this post'
      });
    }

    const updateData = {
      ...req.body,
      image: req.file ? req.file.path : post.image
    };

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    await updatedPost.populate('author', 'username profilePicture');
    if (updatedPost.group) {
      await updatedPost.populate('group', 'name');
    }

    res.status(200).json({
      status: 'success',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

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