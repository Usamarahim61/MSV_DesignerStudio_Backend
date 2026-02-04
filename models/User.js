const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'user']
  }
}, {
  timestamps: true
});

// Index for username
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
