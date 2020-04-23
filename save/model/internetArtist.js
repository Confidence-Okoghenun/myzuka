const mongoose = require('mongoose');

const internetArtistSchema = new mongoose.Schema({
  name: {
    trim: true,
    unique: true,
    type: String,
    required: true,
    lowercase: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('internet_artist', internetArtistSchema);
