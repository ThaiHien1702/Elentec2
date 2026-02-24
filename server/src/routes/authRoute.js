// const express = require("express");
import express from "express";
const { registerUser, loginUser } = require("../controllers/authController"); 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

exports.default = router;