// models/Usage.js
import mongoose from 'mongoose';
import User from './User.js'; // Ensure User model is imported

const UsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['job_post', 'jd_upload', 'resume_process'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Pre-save middleware to increment user's current usage count
UsageSchema.pre('save', async function (next) {
  try {
    const user = await User.findById(this.user);
    if (user) {
      user.currentUsage = (user.currentUsage || 0) + 1; // Ensure field exists
      await user.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Indexing for optimized queries
UsageSchema.index({ user: 1, timestamp: -1 });

export default mongoose.model('Usage', UsageSchema);
