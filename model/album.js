const mongoose = require('mongoose');

const Album = new mongoose.Schema({
  cover: {
    trim: true,
    type: String
  },
  name: {
    trim: true,
    type: String,
    required: true,
    lowercase: true
  },
  year: {
    trim: true,
    type: String
  },
  url: {
    trim: true,
    type: String,
    required: true
  },
  genre: [
    {
      ref: 'genre',
      type: mongoose.SchemaTypes.ObjectId
    }
  ],
  artist: [
    {
      ref: 'artist',
      type: mongoose.SchemaTypes.ObjectId
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

Album.index({ artist: 1, name: 1 }, { unique: true });
Album.index({ name: 'text' });
module.exports = mongoose.model('album', Album);
