const express = require('express');
const router = express.Router();
const { getOrdersByUserId, getOrderById } = require('../queries/orderQueries');
const { passport } = require('../queries/authQueries');  // Adjust path as needed

// Middleware to ensure the user is authenticated
router.use(passport.authenticate('session'));

// GET /orders - Get all orders for the logged-in user
router.get('/', async (req, res) => {
    try {
        const orders = await getOrdersByUserId(req.user.user_id);
        res.json(orders);
    } catch (error) {
        console.error('Failed to get orders', error);
        res.status(500).json({ error: 'Failed to get orders', details: error.message });
    }
});

// GET /orders/:orderId - Get details of a specific order
router.get('/:orderId', async (req, res) => {
    try {
        const order = await getOrderById(req.user.user_id, req.params.orderId);
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