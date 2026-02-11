const Order = require('../models/Order');

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { items, total, userDetails, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !total || !userDetails || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Map items to include 'id' from '_id' if present
    const mappedItems = items.map(item => ({
      id: item._id || item.id,
      name: item.name,
      quantity: item.quantity,
      discountPrice: item.discountPrice,
      image: item.image,
      images: item.images
    }));

    // Create new order
    const order = new Order({
      items: mappedItems,
      total,
      userDetails,
      paymentMethod,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order._id,
        items: order.items,
        total: order.total,
        userDetails: order.userDetails,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (admin only)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order by ID (admin only)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete order (admin only)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
