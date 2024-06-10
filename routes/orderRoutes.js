const express = require('express');
const router = express.Router();
const { getOrdersByUserId, getOrderById } = require('../queries/orderQueries');
const { passport } = require('../queries/authQueries');

// Middleware to ensure the user is authenticated
router.use(passport.authenticate('session'));

// GET /orders - Get all orders for the logged-in user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.user_id; // Get user ID from the session
        console.log('User ID from session:', userId); // Debugging: Ensure user ID is available
        const orders = await getOrdersByUserId(userId);
        res.json(orders);
    } catch (error) {
        console.error('Failed to get orders', error);
        res.status(500).json({ error: 'Failed to get orders', details: error.message });
    }
});

// GET /orders/:orderId - Get details of a specific order
router.get('/:orderId', async (req, res) => {
    try {
        const userId = req.user.user_id; // Get user ID from the session
        console.log('User ID from session:', userId); // Debugging: Ensure user ID is available
        const order = await getOrderById(userId, req.params.orderId);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Failed to get order details', error);
        res.status(500).json({ error: 'Failed to get order details', details: error.message });
    }
});

module.exports = router;
