const express = require('express');
const router = express.Router();
const { getCartByUserId, createCart, addItemToCart, removeItemFromCart, clearCart, checkoutCart } = require('../queries/cartQueries');
const { passport } = require('../queries/authQueries');

router.use(passport.authenticate('session'));

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

router.post('/', async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const updatedCart = await addItemToCart(req.user.user_id, productId, quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: "Failed to add item to cart", error: error.message });
    }
});

router.delete('/', async (req, res) => {
    const { productId } = req.body;
    try {
        await removeItemFromCart(req.user.user_id, productId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Failed to remove item from cart", error: error.message });
    }
});

router.delete('/clear', async (req, res) => {
    try {
        await clearCart(req.user.user_id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Failed to clear cart", error: error.message });
    }
});

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
