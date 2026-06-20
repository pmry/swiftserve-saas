const Restaurant = require('../models/Restaurant');

// ==========================================
// 1. CREATE NEW WORKSPACE BRANCH
// ==========================================
// @desc    Create a new restaurant branch workspace
// @route   POST /api/restaurants
// @access  Private (Owner Only)
exports.createRestaurant = async (req, res) => {
  try {
    const { name, location, description, tables, themeColor } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Restaurant name is mandatory.' });
    }

    const restaurant = await Restaurant.create({
      name: name.trim(),
      location: location ? location.trim() : '',
      description: description ? description.trim() : '',
      tables: tables || 15,
      themeColor: themeColor || '#8C5399',
      owner: req.user.id // Extracted securely from the JWT token middleware
    });

    res.status(201).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('🔴 Mongoose Workspace Creation Error:', error.message);
    res.status(500).json({ success: false, error: 'Database rejected workspace initialization.' });
  }
};

// ==========================================
// 2. GET DASHBOARD WORKSPACES
// ==========================================
// @desc    Get all restaurants owned by the logged-in user
// @route   GET /api/restaurants
// @access  Private (Owner Only)
exports.getOwnerRestaurants = async (req, res) => {
  try {
    // Only return branches that belong to the current active token session
    const restaurants = await Restaurant.find({ owner: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error('🔴 Mongoose Workspace Fetch Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve active workspaces from registry.' });
  }
};

// ==========================================
// 3. UPDATE WORKSPACE SETTINGS
// ==========================================
// @desc    Update a specific restaurant branch configuration
// @route   PUT /api/restaurants/:id
// @access  Private (Owner Only)
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Workspace branch not found.' });
    }

    // Security check: Make sure the person updating it actually owns it
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized access to workspace settings.' });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('🔴 Mongoose Workspace Update Error:', error.message);
    res.status(500).json({ success: false, error: 'Database failed to commit configuration changes.' });
  }
};

// ==========================================
// 4. DELETE WORKSPACE BRANCH
// ==========================================
// @desc    Delete a restaurant and all associated core data
// @route   DELETE /api/restaurants/:id
// @access  Private (Owner Only)
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Workspace branch not found.' });
    }

    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized deletion scope access.' });
    }

    await restaurant.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Workspace branch permanently removed from database cluster.'
    });
  } catch (error) {
    console.error('🔴 Mongoose Workspace Deletion Error:', error.message);
    res.status(500).json({ success: false, error: 'Server exception parsing deletion mutation.' });
  }
};

// ==========================================
// 5. GET PUBLIC RESTAURANT MENU DATA
// ==========================================
// @desc    Get basic public branch details for the customer menu (QR Scan)
// @route   GET /api/restaurants/public/:id
// @access  Public (No token required)
exports.getRestaurantPublic = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛡️ Guard against React sending 'undefined' on initial page loads
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ success: false, error: 'Invalid branch ID mapping.' });
    }

    // Explicitly exclude the owner's ID and secure backend data from the customer response
    const restaurant = await Restaurant.findById(id).select('name location description themeColor tables'); 

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Branch workspace not found.' });
    }

    res.status(200).json({ 
      success: true, 
      data: restaurant 
    });
  } catch (error) {
    console.error('🔴 Public Branch Fetch Error:', error.message);
    res.status(500).json({ success: false, error: 'Server exception mapping branch vectors.' });
  }
};