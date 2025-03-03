import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create user
    const user = await User.create({ name, email, password });
    user.setPlanLimits();
    await user.save();

    // Generate token
    const token = user.createJWT();

    // Don't send password in response
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      usageLimit: user.usageLimit,
      currentUsage: user.currentUsage,
    };

    res.status(201).json({ user: userObj, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = user.createJWT();

    // Don't send password in response
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      usageLimit: user.usageLimit,
      currentUsage: user.currentUsage,
    };

    res.status(200).json({ user: userObj, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;