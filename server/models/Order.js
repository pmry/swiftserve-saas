const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  tableNumber: {
    type: String,
    required: true
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Awaiting Payment', 'Fulfilled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);