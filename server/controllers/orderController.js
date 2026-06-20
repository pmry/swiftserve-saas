const Order = require('../models/Order');

// ==========================================
// 1. CUSTOMER ACTIONS (PUBLIC)
// ==========================================

// @desc    Submit a new order from the customer cart
// @route   POST /api/orders/:restaurantId/submit
// @access  Public
exports.submitOrder = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { tableNumber, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot submit an empty order basket.' });
    }

    const newOrder = await Order.create({
      restaurant: restaurantId,
      tableNumber: tableNumber,
      items: items,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: newOrder
    });
  } catch (error) {
    console.error('🔴 Mongoose Order Submission Error:', error.message);
    res.status(500).json({ success: false, error: 'Server failed to process ticket submission.' });
  }
};

// @desc    Fetch active orders for a specific table station (Live Tracking)
// @route   GET /api/orders/public/:restaurantId/table/:tableNumber
// @access  Public
exports.getTableOrdersPublic = async (req, res) => {
  try {
    const { restaurantId, tableNumber } = req.params;
    
    // Fetch all orders for this table that haven't been completed yet
    const orders = await Order.find({
      restaurant: restaurantId,
      tableNumber: tableNumber,
      status: { $ne: 'Fulfilled' }
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('🔴 Mongoose Table Index Error:', error.message);
    res.status(500).json({ success: false, error: 'Server error pulling live table indexes.' });
  }
};

// @desc    Delete/Cancel a pending order ticket
// @route   DELETE /api/orders/ticket/:id
// @access  Public (Only if Pending)
exports.deleteOrderTicket = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Ticket record not found in database.' });
    }
    
    // Safety lock: Reject cancellation if kitchen staff already started cooking
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, error: 'Cannot cancel order once preparation begins.' });
    }

    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Order ticket canceled successfully.' });
  } catch (error) {
    console.error('🔴 Mongoose Cancellation Error:', error.message);
    res.status(500).json({ success: false, error: 'Server exception handling cancellation.' });
  }
};


// ==========================================
// 2. KITCHEN & ADMIN ACTIONS (PRIVATE)
// ==========================================

// @desc    Get all active orders for the Kitchen Monitor
// @route   GET /api/orders/:restaurantId/pending
// @access  Private
exports.getPendingOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Fetch active tickets, sorting the oldest orders to the top of the queue
    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $in: ['Pending', 'Preparing', 'Ready'] }
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('🔴 Mongoose Kitchen Queue Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch active kitchen pipeline.' });
  }
};

// @desc    Update order status lifecycle (Pending -> Preparing -> Ready -> Fulfilled)
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Ensure the incoming status perfectly matches our allowed schema variables
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Fulfilled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid workflow status string provided.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order ticket not found.' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('🔴 Mongoose Status Update Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to modify backend ticket parameter.' });
  }
};

// @desc    Get ALL completed orders and total lifetime collection revenue
// @route   GET /api/orders/:restaurantId/metrics
// @access  Private
exports.getDailyMetrics = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Fetch ALL successful tickets completed (Time filters completely removed!)
    const completedOrders = await Order.find({
      restaurant: restaurantId,
      status: 'Fulfilled'
    }).sort({ createdAt: -1 }); // Newest history first

    // Calculate total collection money dynamically
    const totalRevenue = completedOrders.reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      return sum + orderTotal;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        ordersCount: completedOrders.length,
        history: completedOrders
      }
    });
  } catch (error) {
    console.error('🔴 Mongoose Metrics Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to aggregate collection metrics.' });
  }
};