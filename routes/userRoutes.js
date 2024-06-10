const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // Required for validation
const { createUser, getUsers, updateUser, deleteUser, getUserById } = require('../queries/userQueries');
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

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User added with ID
 */
router.post('/register', async (req, res) => {
    try {
        const user = await createUser(req.body);
        res.status(201).json({ message: `User added with ID: ${user.user_id}` });
    } catch (error) {
        res.status(500).json({ error: "Failed to add user", details: error.message });
    }
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirect to dashboard on success
 *       401:
 *         description: Unauthorized
 */
router.post('/login', (req, res, next) => {
    console.log("Login attempt with:", req.body);
    next();
}, passport.authenticate('local', {
    failureRedirect: '/api/users/login',
    failureFlash: true
}), (req, res) => {
    res.redirect('/api/users/dashboard');
});

/**
 * @swagger
 * /api/users/login:
 *   get:
 *     summary: Get user login page with messages
 *     responses:
 *       200:
 *         description: Login page with messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/login', (req, res) => {
    const messages = req.flash('error');
    res.json({ success: false, messages });
});

/**
 * @swagger
 * /api/users/dashboard:
 *   get:
 *     summary: Access user dashboard
 *     responses:
 *       200:
 *         description: Accessible only by authenticated users
 *       302:
 *         description: Redirect to login page if not authenticated
 */
router.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Dashboard: Accessible only by authenticated users');
  } else {
    res.redirect('/api/users/login');
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 */
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

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update user profile
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Failed to update user
 */
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

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Failed to delete user
 */
router.delete('/:userId', isAuthenticatedAndAuthorized, async (req, res) => {
    try {
        const user = await deleteUser(req.params.userId);
        res.json({ message: 'User deleted successfully', user });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user", details: error.message });
    }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get a single user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to retrieve user
 */
router.get('/:userId', isAuthenticatedAndAuthorized, async (req, res) => {
    try {
        const user = await getUserById(req.params.userId);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user', details: error.message });
    }
});

module.exports = router;