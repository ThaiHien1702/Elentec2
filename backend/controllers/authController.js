const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const argon2 = require('argon2');


//helper generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    // const {idCompany, name,  password } = req.body;
    //     if (!idCompany || !name || !password) {
    //             return res.status(400).json({ message: 'vui lòng điền đầy đủ thông tin' });
               
    //         }
    // try {
    //    // Check if user already exists
    //     const userExists = await User.findOne({ idCompany});
    //     if (userExists) {
    //         return res.status(400).json({ message: 'Người dùng đã tồn tại' });
    //     }

    //     // // Create new user
    //     const user = await User.create({idCompany, name, password });
    //     if (user) {
    //         res.status(201).json({
    //             _id: user._id,
    //             idCompany: user.idCompany,
    //             name: user.name,
    //             token: generateToken(user._id),
    //         });

    //     } else {
    //         res.status(400).json({ message: 'Invalid user data' });
    //     }
        

    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Server error' });
    // }
    const { idCompany, name, password } = req.body;
    try {
        if (!idCompany || !name  || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

            // Check if user already exists
        const userExists = await User.findOne({ idCompany });
        if (userExists) {
            return res.status(400).json({ message: 'Người dùng đã tồn tại' });
        }

        // Create new user
        const hashedPassword = await argon2.hash(password);
        const newUser = new User({ idCompany, name, password: hashedPassword });
        await newUser.save();

        //return token
        const accessToken = jwt.sign(
            {userId: newUser._id },
            process.env.JWT_SECRET,
        ); 
        res.json({ 
            success: true,
            message: 'Đăng ký thành công',
            accessToken,
        });
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
        if (!idCompany || !password) {
            return res.status(400).json({ message: 'điền id công ty và mật khẩu' });
        }
        const user = await User.findOne({ idCompany }).select('+password');
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: 'Người dùng không tồn tại' });
        }
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Mật khẩu không chính xác' });
        }
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
        );
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            _id: user._id,
            idCompany: user.idCompany,
            name: user.name,
            email: user.email,
            dept: user.dept,
            phone: user.phone,
            accessToken,
        });
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
        const user = await User.findById(req.user.id).populate('user', 'idCompany name email dept phone');
        
        console.log(user);
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
