const express = require('express');
const router = express.Router();
const { 
  addMenuItem, 
  getRestaurantMenu, 
  deleteMenuItem, 
  addMenuBatch 
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 1. SPECIFIC & LITERAL ROUTES (Must be first)
// ==========================================
router.route('/item/:id').delete(protect, deleteMenuItem);
router.route('/:restaurantId/batch').post(protect, addMenuBatch);
router.route('/:restaurantId/item').post(protect, addMenuItem);

// ==========================================
// 2. DYNAMIC CATCH-ALLS (Must be last)
// ==========================================
router.route('/:restaurantId').get(getRestaurantMenu);

module.exports = router;