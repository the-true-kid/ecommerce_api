const express = require('express');
const router = express.Router();
const { getCartByUserId, createCart, addItemToCart, removeItemFromCart, clearCart, checkoutCart } = require('../queries/cartQueries');
const { passport } = require('../queries/authQueries');

router.use(passport.authenticate('session'));

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get the cart for the logged-in user
 *     responses:
 *       200:
 *         description: The user's cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 */
router.get('/', async (req, res) => {
    try {
        let cart = await getCartByUserId(req.user.user_id);
        if (!cart) {
            cart = await createCart(req.user.user_id);
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve or create cart", error: error.message });
    }
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add an item to the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart
 */
router.post('/', async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const updatedCart = await addItemToCart(req.user.user_id, productId, quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: "Failed to add item to cart", error: error.message });
    }
});

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Remove an item from the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Item removed from cart
 */
router.delete('/', async (req, res) => {
    const { productId } = req.body;
    try {
        await removeItemFromCart(req.user.user_id, productId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Failed to remove item from cart", error: error.message });
    }
});

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear the cart
 *     responses:
 *       204:
 *         description: Cart cleared
 */
router.delete('/clear', async (req, res) => {
    try {
        await clearCart(req.user.user_id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Failed to clear cart", error: error.message });
    }
});

/**
 * @swagger
 * /api/cart/{cartId}/checkout:
 *   post:
 *     summary: Checkout the cart
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The cart ID
 *     responses:
 *       200:
 *         description: Checkout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 details:
 *                   type: object
 */
router.post('/:cartId/checkout', async (req, res) => {
    const { cartId } = req.params;
    try {
        const result = await checkoutCart(cartId);
        res.status(200).json({ message: "Checkout successful", details: result });
    } catch (error) {
        res.status(500).json({ message: "Checkout process failed", error: error.message });
    }
});

module.exports = router;