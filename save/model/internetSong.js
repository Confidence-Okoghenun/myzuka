const mongoose = require('mongoose');

const internetSongSchema = new mongoose.Schema({
  name: {
    trim: true,
    type: String,
    required: true,
    lowercase: true
  },
  url: {
    trim: true,
    type: String,
    required: true
  },
  duration: {
    trim: true,
    type: String
  },
  album: {
    ref: 'internet_album',
    type: mongoose.SchemaTypes.ObjectId
  },
  artist: [{ ref: 'internet_artist', type: mongoose.SchemaTypes.ObjectId }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('internet_song', internetSongSchema);
