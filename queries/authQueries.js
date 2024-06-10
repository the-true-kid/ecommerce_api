const { pool } = require('../db');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const setupPassport = () => {
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

  passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const res = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
      if (res.rows.length > 0) {
        const user = res.rows[0];
        done(null, user);
      } else {
        done(new Error('User not found'), null);
      }
    } catch (err) {
      done(err, null);
    }
  });
};

module.exports = { setupPassport, passport };
