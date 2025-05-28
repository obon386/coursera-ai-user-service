const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');
const { toUserIdHex } = require('../utils/userIdUtil');

// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    console.log(`Login attempt for user: ${req.body.email}`);
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const expiresTs = DateTime.local().plus({ hours: 2 }).toFormat("yyyy-MM-dd HH:mm:ss z");
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token: token, expiresTs: expiresTs, userId: user._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user by ID
const getUser = async (req, res) => {
    try {
        let userId;
        try {
            userId = toUserIdHex(req.params.userId);
        } catch (err) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid userId'
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }
        
        // Remove sensitive data before sending
        const { password, ...userWithoutPassword } = user.toObject();
        res.status(200).json({
            status: 'success',
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({
            status: `error: ${error.message}`,
            message: 'Error retrieving user'
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { password, ...updateData } = req.body;
        
        // If password is being updated, hash it first
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({
            status: 'success',
            data: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            status: `error: ${error.message}`,
            message: 'Error updating user'
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User successfully deleted'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error deleting user'
        });
    }
};

// Add more user-related functions (e.g., get user, update user, etc.)

module.exports = { 
    registerUser, 
    loginUser,
    getUser,
    updateUser,
    deleteUser
};