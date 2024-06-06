const { pool } = require('../db');  
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

// Update user profile
const updateUser = async (userId, userDetails) => {
  const { first_name, last_name, email, phone, address, city, state, zip_code } = userDetails;
  const query = `
    UPDATE users
    SET first_name = $1, last_name = $2, email = $3, phone = $4, address = $5, city = $6, state = $7, zip_code = $8
    WHERE user_id = $9
    RETURNING *;`;
  const values = [first_name, last_name, email, phone, address, city, state, zip_code, userId];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete a user
const deleteUser = async (userId) => {
  const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *;';
  const values = [userId];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Retrieve a single user by ID
const getUserById = async (userId) => {
  const query = 'SELECT * FROM users WHERE user_id = $1';
  const values = [userId];
  try {
      const { rows } = await pool.query(query, values);
      return rows[0]; // Return the first row which is the user
  } catch (err) {
      throw err; // It's better to handle errors in route to send proper HTTP response
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserById 
};