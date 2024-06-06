const { pool } = require('../db');

const getCartByUserId = async (userId) => {
    const query = `SELECT * FROM public.cart WHERE user_id = $1`;
    try {
        const { rows } = await pool.query(query, [userId]);
        return rows[0];  // Returns the user's cart if it exists
    } catch (err) {
        console.error('Error getting cart by user ID', err);
        throw err;
    }
};

const createCart = async (userId) => {
    const query = `INSERT INTO public.cart (user_id) VALUES ($1) RETURNING *`;
    try {
        const { rows } = await pool.query(query, [userId]);
        return rows[0];  // Returns the newly created cart
    } catch (err) {
        console.error('Error creating a new cart', err);
        throw err;
    }
};

const addItemToCart = async (userId, productId, quantity) => {
    const query = `
        INSERT INTO public.cartitems (cart_id, product_id, quantity)
        SELECT cart_id, $2, $3 FROM public.cart WHERE user_id = $1
        ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cartitems.quantity + EXCLUDED.quantity
        RETURNING *;
    `;
    try {
        const { rows } = await pool.query(query, [userId, productId, quantity]);
        return rows;  // Returns the updated cart items
    } catch (err) {
        console.error('Error adding item to cart', err);
        throw err;
    }
};

const removeItemFromCart = async (userId, productId) => {
    const query = `
        DELETE FROM public.cartitems
        WHERE cart_id = (SELECT cart_id FROM public.cart WHERE user_id = $1) AND product_id = $2;
    `;
    try {
        await pool.query(query, [userId, productId]);
    } catch (err) {
        console.error('Error removing item from cart', err);
        throw err;
    }
};

const clearCart = async (userId) => {
    const query = `DELETE FROM public.cartitems WHERE cart_id = (SELECT cart_id FROM public.cart WHERE user_id = $1)`;
    try {
        await pool.query(query, [userId]);
    } catch (err) {
        console.error('Error clearing cart', err);
        throw err;
    }
};

module.exports = {
    getCartByUserId,
    createCart,
    addItemToCart,
    removeItemFromCart,
    clearCart
};

