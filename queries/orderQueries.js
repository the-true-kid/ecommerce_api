const { pool } = require('pg');


async function getOrdersByUserId(userId) {
    try {
        const res = await pool.query('SELECT * FROM public.orders WHERE user_id = $1', [userId]);
        return res.rows;
    } catch (err) {
        console.error('Error executing query', err);
        throw err;
    }
}

async function getOrderById(userId, orderId) {
    try {
        const res = await pool.query('SELECT * FROM public.orders WHERE user_id = $1 AND order_id = $2', [userId, orderId]);
        return res.rows[0];
    } catch (err) {
        console.error('Error executing query', err);
        throw err;
    }
}

module.exports = {
    getOrdersByUserId,
    getOrderById
};