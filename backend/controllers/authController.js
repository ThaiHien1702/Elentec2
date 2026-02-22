const jwt = require('jsonwebtoken');
const User = require('../models/User');

//helper generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const {idCompany, name,  password } = req.body;
        if (!idCompany || !name || !password) {
                return res.status(400).json({ message: 'Please provide all required fields' });
               
            }
    try {
       // Check if user already exists
        const userExists = await User.findOne({ idCompany});
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // // Create new user
        const user = await User.create({idCompany, name, password });
        if (user) {
            res.status(201).json({
                _id: user._id,
                idCompany: user.idCompany,
                name: user.name,
                token: generateToken(user._id),
            });

        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
        

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { idCompany,  password } = req.body;
    try {
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        }
};
