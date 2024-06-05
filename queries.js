const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = new Pool({
  user: 'aaronweiss',
  host: 'localhost',
  database: 'ecommerce',
  password: 'password',
  port: 5432,
});

const saltRounds = 10;

// Passport local strategy for login using hashed passwords
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (res.rows.length > 0) {
        const user = res.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (isValid) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      } else {
        return done(null, false, { message: 'No user found with that email address.' });
      }
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const res = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    done(null, res.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Get all users
const getUsers = async (request, response) => {
  try {
    const res = await pool.query('SELECT * FROM users');
    response.status(200).json(res.rows);
  } catch (error) {
    response.status(500).json({ error: "Database query failed", details: error.message });
  }
};

// Create a new user
const createUser = async (request, response) => {
  const { first_name, last_name, email, password, phone, address, city, state, zip_code } = request.body;

  try {
      const hashedPassword = await bcrypt.hash(password, 10); // Ensure you have bcrypt required and setup
      const result = await pool.query(
          'INSERT INTO users (first_name, last_name, email, password_hash, phone, address, city, state, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING user_id',
          [first_name, last_name, email, hashedPassword, phone, address, city, state, zip_code]
      );
      response.status(201).json({ message: `User added with ID: ${result.rows[0].user_id}` });
  } catch (error) {
      response.status(500).json({ error: "Failed to add user due to database error", details: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  passport
};