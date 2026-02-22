const express = require("express");
const { registerUser, loginUser, getMe,updateUserProfile } = require('../controllers/authController');
// const { protect } = require('../middlewares/authMiddleware');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateUserProfile);


module.exports = router;
