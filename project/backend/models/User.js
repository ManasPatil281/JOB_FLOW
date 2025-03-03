// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  plan: {
    type: String,
    enum: ['Free', 'Basic', 'Pro'],
    default: 'Free'
  },
  usageLimit: {
    type: Number,
    default: 100 // Free plan limit
  },
  currentUsage: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
UserSchema.methods.createJWT = function() {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET || 'your_jwt_secret_here',
    { expiresIn: '30d' }
  );
};

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Set usage limits based on plan
UserSchema.methods.setPlanLimits = function() {
  switch(this.plan) {
    case 'Pro':
      this.usageLimit = 1000;
      break;
    case 'Basic':
      this.usageLimit = 300;
      break;
    default:
      this.usageLimit = 100; // Free plan
  }
};

export default mongoose.model('User', UserSchema);