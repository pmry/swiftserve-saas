const express = require('express');
const router = express.Router();

// ==========================================
// 1. IMPORT CONTROLLERS SYSTEM
// ==========================================
const { 
  createRestaurant, 
  getOwnerRestaurants, 
  updateRestaurant, 
  deleteRestaurant,
  getRestaurantPublic 
} = require('../controllers/restaurantController');

// Import your token decryption security middleware guard rules
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 2. PUBLIC ROUTE INSTANCES (No Auth Required)
// ==========================================
// Matches: GET /api/restaurants/public/:id
// Customer mobile browsers hit this when arriving via QR parameters mapping
router.get('/public/:id', getRestaurantPublic);

// ==========================================
// 3. PRIVATE ADMIN WORKSPACE CONFIGS ROUTES
// ==========================================
// Matches: GET /api/restaurants & POST /api/restaurants
router.route('/')
  .get(protect, getOwnerRestaurants)
  .post(protect, createRestaurant);

// Matches: PUT /api/restaurants/:id & DELETE /api/restaurants/:id
router.route('/:id')
  .put(protect, updateRestaurant)
  .delete(protect, deleteRestaurant);

module.exports = router;