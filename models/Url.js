const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

urlSchema.index({ originalUrl: 1 });
urlSchema.index({ shortCode: 1 });

module.exports = mongoose.model('Url', urlSchema);