const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    refreshId: { type: String, index: true },
    device: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    revoked: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    address: { type: Object },
    avatar: { type: String, trim: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    emailVerified: { type: Boolean, default: false },
    failedLoginCount: { type: Number, default: 0 },
    lockUntil: { type: Date },
    sessions: [sessionSchema],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ 'sessions.refreshId': 1 });

module.exports = mongoose.model('User', userSchema);
