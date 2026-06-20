const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cafe/Restaurant name is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String, // Will store Cloudinary image URL
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#10b981' // Default emerald-500 hex code
  },
  tablesCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Under Development'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);