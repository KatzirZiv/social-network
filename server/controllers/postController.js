const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const { content, media, group } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const post = new Post({
      content: content.trim(),
      media: media?.trim() || null,
      author: req.user._id,
      group: group || null,
      likes: [],
      comments: []
    });

    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePicture')
      .populate('group', 'name')
      .populate('likes', 'username profilePicture')
      .populate('comments.author', 'username profilePicture')
      .lean();

    res.status(201).json({ 
      message: 'Post created successfully',
      data: { post: populatedPost } 
    });
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(400).json({ message: error.message || 'Failed to create post' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username profilePicture')
      .populate('group', 'name')
      .populate('likes', 'username profilePicture')
      .populate('comments.author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ 
      message: 'Posts retrieved successfully',
      data: { posts } 
    });
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(400).json({ message: error.message || 'Failed to retrieve posts' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.findIndex(like => like.toString() === userId.toString());
    
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePicture')
      .populate('group', 'name')
      .populate('likes', 'username profilePicture')
      .populate('comments.author', 'username profilePicture')
      .lean();

    res.json({ 
      message: likeIndex === -1 ? 'Post liked successfully' : 'Post unliked successfully',
      data: { post: populatedPost } 
    });
  } catch (error) {
    console.error('Error in likePost:', error);
    res.status(400).json({ message: error.message || 'Failed to update like status' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content: content.trim(),
      author: req.user._id,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePicture')
      .populate('group', 'name')
      .populate('likes', 'username profilePicture')
      .populate('comments.author', 'username profilePicture')
      .lean();

    res.json({ 
      message: 'Comment added successfully',
      data: { post: populatedPost } 
    });
  } catch (error) {
    console.error('Error in addComment:', error);
    res.status(400).json({ message: error.message || 'Failed to add comment' });
  }
}; 