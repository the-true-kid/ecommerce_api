const express = require('express');
const router = express.Router();
const { createUser, getUsers } = require('../queries/userQueries');  // Import user-related operations
const passport = require('passport');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const user = await createUser(req.body);
        res.status(201).json({ message: `User added with ID: ${user.user_id}` });
    } catch (error) {
        res.status(500).json({ error: "Failed to add user", details: error.message });
    }
});

// Login a user
router.post('/login', (req, res, next) => {
    console.log("Login attempt with:", req.body);
    next();
}, passport.authenticate('local', {
    failureRedirect: '/api/users/login',  // Ensure this is adjusted if needed
    failureFlash: true
}), (req, res) => {
    res.redirect('/api/users/dashboard');  // Ensure redirection is appropriate
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
    res.redirect('/api/users/login');
  }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users", details: error.message });
    }
});

module.exports = router;