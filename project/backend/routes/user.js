import express from 'express';
import User from '../models/User.js';
import Usage from '../models/Usage.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      usageLimit: user.usageLimit,
      currentUsage: user.currentUsage,
    };

    res.status(200).json({ user: userObj });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user usage statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Get basic statistics
    const jobPostsCount = await Usage.countDocuments({
      user: req.user.userId,
      type: 'job_post',
    });

    const jdsUploadedCount = await Usage.countDocuments({
      user: req.user.userId,
      type: 'jd_upload',
    });

    const resumesProcessedCount = await Usage.countDocuments({
      user: req.user.userId,
      type: 'resume_process',
    });

    // Get last activity
    const lastActivity = await Usage.findOne({
      user: req.user.userId,
    }).sort({ timestamp: -1 });

    // Prepare stats object
    const stats = {
      jobPosts: jobPostsCount,
      jdsUploaded: jdsUploadedCount,
      resumesProcessed: resumesProcessedCount,
      lastActive: lastActivity ? lastActivity.timestamp : null,
    };

    // Get daily usage data (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyUsage = await Usage.aggregate([
      {
        $match: {
          user: req.user.userId,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Process daily data
    const dailyData = {
      dates: [],
      jobPosts: [],
      jdsUploaded: [],
      resumesProcessed: [],
    };

    // Initialize with all dates in the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData.dates.push(dateStr);
      dailyData.jobPosts.push(0);
      dailyData.jdsUploaded.push(0);
      dailyData.resumesProcessed.push(0);
    }

    // Fill in actual usage data
    dailyUsage.forEach((item) => {
      const dateStr = item._id.date;
      const type = item._id.type;
      const count = item.count;

      const dateIndex = dailyData.dates.indexOf(dateStr);
      if (dateIndex !== -1) {
        if (type === 'job_post') {
          dailyData.jobPosts[dateIndex] = count;
        } else if (type === 'jd_upload') {
          dailyData.jdsUploaded[dateIndex] = count;
        } else if (type === 'resume_process') {
          dailyData.resumesProcessed[dateIndex] = count;
        }
      }
    });

    // Add daily data to stats
    stats.dailyData = dailyData;

    // Get plan usage percentage
    const user = await User.findById(req.user.userId);
    if (user) {
      stats.planUsage = {
        current: user.currentUsage,
        limit: user.usageLimit,
        percentage: (user.currentUsage / user.usageLimit) * 100,
      };
    }

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user plan
router.put('/plan', auth, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!['free', 'basic', 'premium', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.plan = plan;
    user.setPlanLimits();
    await user.save();

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      usageLimit: user.usageLimit,
      currentUsage: user.currentUsage,
    };

    res.status(200).json({ user: userObj });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) {
      // Check if email already exists for another user
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updateFields.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      usageLimit: user.usageLimit,
      currentUsage: user.currentUsage,
    };

    res.status(200).json({ user: userObj });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update to new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save usage data
router.post('/usage', auth, async (req, res) => {
  try {
    const { type, details } = req.body;

    // Validate the type
    if (!['job_post', 'jd_upload', 'resume_process'].includes(type)) {
      return res.status(400).json({ error: 'Invalid usage type' });
    }

    // Create a new usage record
    const newUsage = new Usage({
      user: req.user.userId, // The authenticated user's ID
      type,
      details,
    });

    // Save the usage record to the database
    await newUsage.save();

    // Update the user's current usage count
    const user = await User.findById(req.user.userId);
    if (user) {
      user.currentUsage += 1; // Increment the usage count
      await user.save();
    }

    res.status(201).json({ message: 'Usage recorded successfully', usage: newUsage });
  } catch (error) {
    console.error('Error saving usage:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export the router
export default router;