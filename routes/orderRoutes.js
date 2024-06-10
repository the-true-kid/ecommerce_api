const express = require('express');
const router = express.Router();
const { getOrdersByUserId, getOrderById } = require('../queries/orderQueries');
const { passport } = require('../queries/authQueries');

// Middleware to ensure the user is authenticated
router.use(passport.authenticate('session'));

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   order_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   total_price:
 *                     type: number
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 */
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

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get details of a specific order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 total_price:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to retrieve order details
 */
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