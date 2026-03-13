const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  release_date: {
    type: Date,
    required: true
  },
  platforms: {
    type: [String],
    required: true
  },
  genres: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cover_image: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  average_rating: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Game', GameSchema);
