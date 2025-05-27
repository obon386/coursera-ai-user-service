const express = require('express');
const { registerUser, loginUser, getUser, updateUser, deleteUser } = require('../controllers/userController');
const validateRequest = require('../middleware/validateRequest');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Auth routes
router.post('/register', validateRequest, registerUser);
router.post('/login', validateRequest, loginUser);

// User management routes
router.get('/:userId', getUser);
router.put('/:userId', authenticateToken, validateRequest, updateUser);
router.delete('/:userId', deleteUser);

module.exports = router;