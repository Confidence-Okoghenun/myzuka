const mongoose = require('mongoose');

const Genre = new mongoose.Schema({
  name: {
    trim: true,
    unique: true,
    type: String,
    required: true,
    lowercase: true
  },
  createdAt: { type: Date, default: Date.now }
});

Genre.index({ name: 'text' });
module.exports = mongoose.model('genre', Genre);
