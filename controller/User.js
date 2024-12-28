const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.registerUser = async (req, res) => {
  console.log('trig');
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, password: hashedPassword });
    const token = generateToken(user.id);
    res.status(201).json({
      token,
      message: 'user has been regitered successfully'
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id);

    const options = {
      httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Secure only in production
  sameSite: 'lax', // Adjust based on cross-origin needs
  maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    user.password = '';

    res.status(201).cookie('token', token, options).json({ user, message: 'user is logged successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateUserProfile = async (req, res) => {
  let { userId } = req.params;
  console.log(userId);
  const { email, password } = req.body;
  console.log(req.body)

  try {
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
