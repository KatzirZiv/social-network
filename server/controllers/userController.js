const User = require('../models/User');

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'friends',
        select: 'username email profilePicture',
        options: { lean: true }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      data: { 
        friends: user.friends || [] 
      } 
    });
  } catch (error) {
    console.error('Error in getFriends:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const friendId = req.params.id;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    user.friends.push(friendId);
    friend.friends.push(req.user._id);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const friendId = req.params.id;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.user._id.toString());

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('friends', 'username email profilePicture');
    res.json({ data: { user } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 