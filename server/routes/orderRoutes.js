const express = require('express');
const router = express.Router();

// Import the database model needed for the inline cancellation feature
const Order = require('../models/Order');

// Import all controller functions
const { 
  submitOrder, 
  getPendingOrders, 
  updateOrderStatus, 
  getTableOrdersPublic,
  getDailyMetrics 
} = require('../controllers/orderController');

// Import the token protection middleware for admin panels
const { protect } = require('../middleware/authMiddleware');


// ==========================================
// 1. PUBLIC ENDPOINTS (No Token Required)
// ==========================================

// Matches: POST /api/orders/:restaurantId/submit
// Triggered when a guest submits their cart from their phone
router.post('/:restaurantId/submit', submitOrder);

// Matches: GET /api/orders/public/:restaurantId/table/:tableNumber
// Triggered by the 3-second live background status polling loop on customer phones
router.get('/public/:restaurantId/table/:tableNumber', getTableOrdersPublic);

// Matches: DELETE /api/orders/ticket/:id
// Triggered when a customer clicks the trash bin to cancel their pending order
router.delete('/ticket/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Ticket record not found" });
    }
    
    // Safety check: Don't allow cancellation if kitchen staff already changed status to Preparing
    if (order.status !== 'Pending') {
      return res.status(400).json({ error: "Cannot cancel order once preparation begins" });
    }

    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order ticket canceled successfully" });
  } catch (err) {
    console.error("🔴 Deletion Exception:", err.message);
    res.status(500).json({ error: "Server exception handling cancellation" });
  }
});


// ==========================================
// 2. PRIVATE ADMINISTRATIVE ENDPOINTS
// ==========================================

// Matches: GET /api/orders/:restaurantId/pending
// Triggered by the live Kitchen Monitor dashboard screen to display active tickets
router.get('/:restaurantId/pending', protect, getPendingOrders);

// Matches: GET /api/orders/:restaurantId/metrics
// Triggered by the new History & Revenue dashboard to see today's collection
router.get('/:restaurantId/metrics', protect, getDailyMetrics);

// Matches: PUT /api/orders/:id/status
// Triggered when kitchen staff clicks "Accept", "Ready to Serve", or "Complete"
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;