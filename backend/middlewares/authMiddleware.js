const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// const protect = async (req, res, next) => {
// 	let token;

// 	if (
// 		req.headers.authorization &&
// 		req.headers.authorization.startsWith('Bearer')
// 	) {
// 		try {
// 			// Get token from header
// 			token = req.headers.authorization.split(' ')[1];
// 			// Verify token
// 			const decoded = jwt.verify(token, process.env.JWT_SECRET);
// 			// Get user from the token
// 			req.user = await User.findById(decoded.id).select('-password');
// 			next();
// 		} catch (error) {
// 			console.error(error);
// 			return res.status(401).json({ message: 'Not authorized, token failed' });
// 		}
// 	}
// 	if (!token) {
// 		return res.status(401).json({ message: 'Not authorized, no token' });
// 	}
// };
const protect = async (req, res, next) => {
	const authHeader = req.header('Authorization')
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.status(401).json({ message: 'Not authorized, no token' })
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = await User.findById(decoded.id).select('-password')
		next()
	} catch (error) {
		console.error(error)
		return res.status(401).json({ message: 'Not authorized, token failed' })
	}
}

module.exports = protect;
