const mongoose = require('mongoose');

const internetAlbumSchema = new mongoose.Schema({
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
  genre: [
    {
      trim: true,
      type: String,
      lowercase: true
    }
  ],
  url: {
    trim: true,
    type: String,
    required: true
  },
  artist: [
    {
      ref: 'internet_artist',
      type: mongoose.SchemaTypes.ObjectId
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

internetAlbumSchema.index({ artist: 1, name: 1}, { unique: true });

module.exports = mongoose.model('internet_album', internetAlbumSchema);
