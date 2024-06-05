const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // Required for validation
const { createUser, getUsers, updateUser, deleteUser } = require('../queries/userQueries');
const passport = require('passport');

// Middleware to check if the user is logged in and authorized
function isAuthenticatedAndAuthorized(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.user_id === parseInt(req.params.userId) || req.user.isAdmin) {
            return next();
        }
        return res.status(403).json({ message: 'Not authorized to perform this action' });
    }
    res.status(401).json({ message: 'You need to be logged in to perform this action' });
}

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
    failureRedirect: '/api/users/login',
    failureFlash: true
}), (req, res) => {
    res.redirect('/api/users/dashboard');
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

// Validation rules for updating user
const userUpdateValidationRules = [
    body('email').isEmail().withMessage('Provide a valid email address'),
    body('first_name').notEmpty().withMessage('First name cannot be empty'),
    // Add other validation rules as needed
];

// Update user profile
router.put('/:userId', isAuthenticatedAndAuthorized, userUpdateValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await updateUser(req.params.userId, req.body);
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: "Failed to update user", details: error.message });
    }
});

// Delete a user
router.delete('/:userId', isAuthenticatedAndAuthorized, async (req, res) => {
    try {
        const user = await deleteUser(req.params.userId);
        res.json({ message: 'User deleted successfully', user });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user", details: error.message });
    }
});

module.exports = router;
