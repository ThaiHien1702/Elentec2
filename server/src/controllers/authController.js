const User = require("../models/User");



exports.registerUser =  async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.loginUser = async (req, res) => {
    try {

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
