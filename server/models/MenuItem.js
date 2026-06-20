const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  category: {
    type: String,
    required: [true, 'Category assignment is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true // Used for the "Sold Out" live toggle later!
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);