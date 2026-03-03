import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/session.js";

const ACCESS_TOKEN_TTL = "90m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const signUp = async (req, res) => {
  try {
    // lấy input
    const { username, password, email, displayName, role } = req.body;
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

    // tạo user mới - role có thể được truyền vào hoặc mặc định là "user"
    await User.create({
      username,
      hashedPassword,
      email,
      displayName,
      role: role || "user",
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
    // Nếu user không tồn tại, user = null
    if (!user) {
      return res
        .status(409)
        .json({ message: "username hoặc password không đúng" });
    }
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword); // ❌ CRASH
    if (!passwordCorrect) {
      return res
        .status(409)
        .json({ message: "username hoặc password không đúng" });
    }
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );
    //tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    //tạo session để lưu refesh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    //trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", //backend, frontend deploy riêng
      maxAge: REFRESH_TOKEN_TTL,
    });
    //trả accedd token về res
    return res.status(200).json({
      message: `User ${user.displayName} đã logged in!`,
      accessToken,
      role: user.role,
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    //lấy token từ cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(400).json({ message: "Token không tồn tại" });
    }
    //xóa session
    await Session.deleteOne({ refreshToken: token });
    //xóa cookie
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Đã logout thành công" });
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
