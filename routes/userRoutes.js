const express = require('express');
const router = express.Router();
const db = require('../queries');
const passport = require('passport');

// Register a new user
router.post('/register', db.createUser);

// Login a user
router.post('/login', (req, res, next) => {
    console.log("Login attempt with:", req.body);
    next();
}, passport.authenticate('local', {
    failureRedirect: '/api/users/login',  // Adjusted redirect path
    failureFlash: true
}), (req, res) => {
    res.redirect('/api/users/dashboard');  // Adjusted redirect path
});

// Get user login page with messages
router.get('/login', (req, res) => {
    const messages = req.flash('error');
    res.json({ success: false, messages });
});

// Access user dashboard
router.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Dashboard: Accessible only by authenticated users');
  } else {
    res.redirect('/api/users/login');  // Adjusted redirect path
}
});

router.get('/', db.getUsers)

module.exports = router;