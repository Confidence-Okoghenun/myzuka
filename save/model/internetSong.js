const mongoose = require('mongoose');

const internetSongSchema = new mongoose.Schema({
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
  album: {
    ref: 'internet_album',
    type: mongoose.SchemaTypes.ObjectId
  },
  createdAt: { type: Date, default: Date.now }
});

internetSongSchema.index({ album: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('internet_song', internetSongSchema);
