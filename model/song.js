const mongoose = require('mongoose');

const Song = new mongoose.Schema({
  name: {
    trim: true,
    type: String,
    required: true,
    lowercase: true
  },
  duration: {
    trim: true,
    type: String
  },
  playId: {
    trim: true,
    type: String
  },
  album: {
    ref: 'album',
    type: mongoose.SchemaTypes.ObjectId
  },
  createdAt: { type: Date, default: Date.now }
});

Song.index({ album: 1, name: 1 }, { unique: true });
Song.index({ name: 'text' });
module.exports = mongoose.model('song', Song);
