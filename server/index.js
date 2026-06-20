const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ==========================================
// 1. IMPORT ROUTE CONTROLLERS
// ==========================================
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// ==========================================
// 2. GLOBAL ROUTER MIDDLEWARE & CORS CONTEXT
// ==========================================
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (origin.startsWith('http://localhost') || origin.endsWith('.devtunnels.ms')) {
      return callback(null, true);
    } else {
      return callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// 🛡️ THE EXPRESS v5 FIX: 
// Passing a RegExp literal (/.*/) bypasses the path-to-regexp string parser!
app.options(/.*/, cors());

// Built-in body parsers for processing json datasets safely
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic Visual Request Logger
app.use((req, res, next) => {
  console.log(`📡 Incoming Request: [${req.method}] ${req.url}`);
  next();
});

// ==========================================
// 3. MOUNT CORE ENDPOINTS SYSTEM API
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Base server health ping
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ==========================================
// 4. ROUTING FALLBACKS & ERROR HANDLING
// ==========================================
// Express v5 safe catch-all handler for missing routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint cluster destination path not found' });
});

// Global Central Error Catch Engine
app.use((err, req, res, next) => {
  console.error('🔴 Unhandled System Exception Intercepted:', err.message);
  res.status(500).json({ error: 'Internal Server Error Runtime Exception', details: err.message });
});

// ==========================================
// 5. DATABASE HANDSHAKE & SERVER STARTUP
// ==========================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swiftserve-saas';

mongoose.set('strictQuery', false);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('============= CLUSTER BOOT =============');
    console.log('✅ MongoDB Connected Successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 SwiftServe Engine live on port ${PORT}`);
      console.log('========================================');
    });
  })
  .catch((err) => {
    console.error('❌ Database connectivity handshake sequence rejected:', err.message);
    process.exit(1);
  });