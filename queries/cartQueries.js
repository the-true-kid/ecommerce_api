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

const checkoutCart = async (cartId, userId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');  // Start transaction

        // Create a new order entry
        const createOrderQuery = `
            INSERT INTO public.orders (user_id, status, total_amount)
            SELECT user_id, 'Pending', SUM(quantity * price) FROM public.cartitems
            JOIN public.products ON cartitems.product_id = products.product_id
            WHERE cart_id = $1
            GROUP BY user_id
            RETURNING order_id;
        `;
        const orderResult = await client.query(createOrderQuery, [cartId]);
        const orderId = orderResult.rows[0].order_id;

        // Transfer cart items to order items
        const transferItemsQuery = `
            INSERT INTO public.orderitems (order_id, product_id, quantity, price)
            SELECT $1, product_id, quantity, price FROM public.cartitems
            JOIN public.products ON cartitems.product_id = products.product_id
            WHERE cart_id = $2;
        `;
        await client.query(transferItemsQuery, [orderId, cartId]);

        // Optionally, update inventory
        // const updateInventoryQuery = `UPDATE public.products SET stock = stock - quantity WHERE product_id IN (SELECT product_id FROM cartitems WHERE cart_id = $1)`;
        // await client.query(updateInventoryQuery, [cartId]);

        // Clear the cart (if needed)
        const clearCartQuery = 'DELETE FROM public.cartitems WHERE cart_id = $1';
        await client.query(clearCartQuery, [cartId]);

        await client.query('COMMIT');  // Commit the transaction
        return { orderId, status: 'Checkout successful' };  // Return the new order ID and status
    } catch (err) {
        await client.query('ROLLBACK');  // Rollback transaction on error
        throw err;
    } finally {
        client.release();  // Release client back to the pool
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

