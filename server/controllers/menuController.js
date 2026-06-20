const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// ==========================================
// 1. ADD NEW MENU ITEM
// ==========================================
// @desc    Add a single menu item to a restaurant
// @route   POST /api/menu/:restaurantId/item
// @access  Private (Owner Only)
exports.addMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, price, category, description, imageUrl } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, error: 'Missing required parameters: name, price, and category are mandatory.' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant workspace instance not found.' });
    }
    
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized inventory management access mapping.' });
    }

    const newItem = await MenuItem.create({
      name: name.trim(),
      price: parseFloat(price),
      category: category.trim(),
      description: description ? description.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      restaurant: restaurantId
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error('🔴 Mongoose Menu Item Creation Exception:', error.message);
    res.status(500).json({ success: false, error: 'Database schema rejected allocation creation parameters.', details: error.message });
  }
};

// ==========================================
// 2. FETCH FULL RESTAURANT MENU
// ==========================================
// @desc    Get full menu items list for a restaurant
// @route   GET /api/menu/:restaurantId
// @access  Public
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // 🛡️ THE FIX: Guard against React sending "undefined" during initial renders
    if (!restaurantId || restaurantId === 'undefined' || restaurantId === 'null') {
      return res.status(200).json({
        success: true,
        categories: ['Appetizers', 'Main Course', 'Desserts', 'Drinks'],
        items: []
      });
    }

    // Pull all items stored under this restaurant reference allocation
    const items = await MenuItem.find({ restaurant: restaurantId });
    
    // Core Seed Fallback standard listing array rules
    const defaultCategories = ['Appetizers', 'Main Course', 'Desserts', 'Drinks'];
    
    // Combine items matching inside the database alongside defaults to prevent losing empty categories
    const dbCategories = items.map(item => item.category);
    const combinedCategories = [...new Set([...defaultCategories, ...dbCategories])];
    
    res.status(200).json({
      success: true,
      categories: combinedCategories,
      items: items || []
    });
  } catch (error) {
    console.error('🔴 Mongoose Menu Fetch Error:', error.message);
    res.status(500).json({ success: false, error: 'Server exception pulling layout indexes from database.' });
  }
};

// ==========================================
// 3. REMOVE MENU ITEM FROM REGISTRY
// ==========================================
// @desc    Delete a specific menu item
// @route   DELETE /api/menu/item/:id
// @access  Private (Owner Only)
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findById(id).populate('restaurant');
    if (!item) {
      return res.status(404).json({ success: false, error: 'Target menu item entry not found.' });
    }

    if (!item.restaurant || item.restaurant.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized structural deletion scope access.' });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Item removed successfully from database catalog.' });
  } catch (error) {
    console.error('🔴 Mongoose Menu Deletion Exception:', error.message);
    res.status(500).json({ success: false, error: 'Server error parsing dynamic deletion mutation variables.' });
  }
};

// ==========================================
// 4. BATCH UPLOAD MENU ITEMS 
// ==========================================
// @desc    Add multiple menu items at once (Batch Import)
// @route   POST /api/menu/:restaurantId/batch
// @access  Private (Owner Only)
exports.addMenuBatch = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const itemsArray = Array.isArray(req.body) ? req.body : req.body.items;

    if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid array of items provided for batch upload.' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized inventory management access.' });
    }

    const formattedItems = itemsArray.map(item => ({
      name: item.name?.trim(),
      price: parseFloat(item.price),
      category: item.category?.trim() || 'Uncategorized',
      description: item.description?.trim() || '',
      imageUrl: item.imageUrl?.trim() || '',
      restaurant: restaurantId
    }));

    const savedItems = await MenuItem.insertMany(formattedItems);

    res.status(201).json({
      success: true,
      message: `${savedItems.length} items successfully batched.`,
      data: savedItems
    });
  } catch (error) {
    console.error('🔴 Mongoose Batch Creation Exception:', error.message);
    res.status(500).json({ success: false, error: 'Server failed to process bulk menu allocation.' });
  }
};