const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// This is a protected route! You must pass the JWT token in the header to access it.
router.get('/me', protect, getMe);

module.exports = router;