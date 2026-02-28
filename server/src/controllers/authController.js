import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "90m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const signUp = async (req, res) => {
  try {
    // lấy input
    const { username, password, email, displayName } = req.body;
    // check xem có dữ liệu không
    if (!username || !password || !email || !displayName) {
      return res.status(400).json({
        message: "Không thể thiếu username, password, email, displayName ",
      });
    }

    // kiểm tra username tồn tại chưa
    const duplicate = await User.findOne({ username });

    if (duplicate) {
      return res.status(409).json({ message: "username đã tồn tại" });
    }

    // mã hoá password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    // tạo user mới
    await User.create({
      username,
      hashedPassword,
      email,
      displayName,
    });

    // return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    // lấy input
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username và password không có dữ liệu" });
    }
    // lấy dữ liệu user trong db
    const user = await User.findOne({ username });
    // kiểm tra pasword
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res
        .status(409)
        .json({ message: "username hoặc password không đúng" });
    }
    const accsessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    //tạo refresh token
    //tạo session để lưu refesh token
    //trả refresh token về trong cookie
    //trả accedd token về res
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
