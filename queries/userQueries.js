const { pool } = require('../db');  // Assuming you export the pool from a central db file
const bcrypt = require('bcryptjs');

// Get all users
const getUsers = async () => {
  const res = await pool.query('SELECT * FROM users');
  return res.rows;
};

// Create a new user
const createUser = async (userDetails) => {
  const { first_name, last_name, email, password, phone, address, city, state, zip_code } = userDetails;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (first_name, last_name, email, password_hash, phone, address, city, state, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING user_id',
    [first_name, last_name, email, hashedPassword, phone, address, city, state, zip_code]
  );
  return result.rows[0];
};

module.exports = {
  getUsers,
  createUser
};