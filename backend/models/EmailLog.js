const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    to: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      required: true,
      default: 'pending',
    },
    attemptCount: { type: Number, default: 0 },
    lastError: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmailLog', emailLogSchema);
