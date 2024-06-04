const { Pool } = require('pg');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = new Pool({
  user: 'aaronweiss',
  host: 'localhost',
  database: 'ecommerce',
  password: 'password',
  port: 5432,
});

// Passport local strategy for login using plaintext password (not recommended)
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    pool.query('SELECT * FROM users WHERE email = $1', [email], (err, results) => {
      if (err) {
        return done(err);
      }
      if (results.rows.length > 0) {
        const user = results.rows[0];

        // Compare plaintext passwords directly (highly insecure)
        if (user.password_hash === password) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      } else {
        return done(null, false, { message: 'No user found with that email address.' });
      }
    });
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
  pool.query('SELECT * FROM users WHERE user_id = $1', [id], (err, results) => {
    if (err) {
      return done(err);
    }
    done(null, results.rows[0]);
  });
});

// Get all users
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// Create a new user
const createUser = (request, response) => {
  const { first_name, last_name, email, password, phone, address, city, state, zip_code } = request.body;
  
  pool.query(
    'INSERT INTO users (first_name, last_name, email, password_hash, phone, address, city, state, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [first_name, last_name, email, password, phone, address, city, state, zip_code],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`User added with ID: ${results.insertId}`);
    }
  );
};

module.exports = {
  getUsers,
  createUser,
  passport
};
