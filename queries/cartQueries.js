const { pool } = require('../db');

// Get cart by user ID
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

// Create a new cart for a user
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

// Add item to cart
const addItemToCart = async (userId, productId, quantity) => {
    const cart = await getCartByUserId(userId);
    let cartId;

    if (!cart) {
        const newCart = await createCart(userId);
        cartId = newCart.cart_id;
    } else {
        cartId = cart.cart_id;
    }

    const res = await pool.query(
        `INSERT INTO public.cartitems (cart_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (cart_id, product_id)
         DO UPDATE SET quantity = public.cartitems.quantity + EXCLUDED.quantity
         RETURNING *`,
        [cartId, productId, quantity]
    );

    return res.rows[0];
};

// Remove item from cart
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

// Clear cart
const clearCart = async (userId) => {
    const query = `DELETE FROM public.cartitems WHERE cart_id = (SELECT cart_id FROM public.cart WHERE user_id = $1)`;
    try {
        await pool.query(query, [userId]);
    } catch (err) {
        console.error('Error clearing cart', err);
        throw err;
    }
};

// Checkout cart
const checkoutCart = async (cartId) => {
    try {
        const userRes = await pool.query('SELECT user_id FROM public.cart WHERE cart_id = $1', [cartId]);
        const user = userRes.rows[0];

        if (!user) {
            throw new Error('Cart not found');
        }

        const userId = user.user_id;

        const cartItemsRes = await pool.query(
            'SELECT * FROM public.cartitems WHERE cart_id = $1',
            [cartId]
        );
        const cartItems = cartItemsRes.rows;

        if (cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + item.total_price, 0);

        const userAddressRes = await pool.query(
            'SELECT address AS shipping_address, address AS billing_address FROM public.users WHERE user_id = $1',
            [userId]
        );
        const userAddress = userAddressRes.rows[0];

        const orderRes = await pool.query(
            `INSERT INTO public.orders (user_id, status, total_amount, shipping_address, billing_address)
             VALUES ($1, 'Pending', $2, $3, $4) RETURNING *`,
            [userId, totalAmount, userAddress.shipping_address, userAddress.billing_address]
        );
        const order = orderRes.rows[0];

        for (const item of cartItems) {
            await pool.query(
                `INSERT INTO public.orderitems (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [order.order_id, item.product_id, item.quantity, item.price]
            );
        }

        await pool.query('DELETE FROM public.cartitems WHERE cart_id = $1', [cartId]);

        return order;
    } catch (err) {
        console.error('Error during checkout', err);
        throw err;
    }
};

module.exports = {
    getCartByUserId,
    createCart,
    addItemToCart,
    removeItemFromCart,
    clearCart,
    checkoutCart
};
