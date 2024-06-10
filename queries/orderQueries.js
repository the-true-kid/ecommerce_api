const { pool } = require('../db');

const getOrdersByUserId = async (userId) => {
    const query = `SELECT * FROM public.orders WHERE user_id = $1`;
    try {
        console.log('Running query with userId:', userId); // Debugging: Ensure userId is correct
        const { rows } = await pool.query(query, [userId]);
        return rows;
    } catch (err) {
        console.error('Error getting orders by user ID', err);
        throw err;
    }
};

const getOrderById = async (userId, orderId) => {
    const query = `SELECT * FROM public.orders WHERE user_id = $1 AND order_id = $2`;
    try {
        console.log('Running query with userId:', userId, 'orderId:', orderId); // Debugging: Ensure userId and orderId are correct
        const { rows } = await pool.query(query, [userId, orderId]);
        return rows[0];
    } catch (err) {
        console.error('Error getting order by ID', err);
        throw err;
    }
};

module.exports = {
    getOrdersByUserId,
    getOrderById,
};
