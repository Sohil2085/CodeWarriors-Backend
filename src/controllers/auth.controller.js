import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pkg from "@prisma/client";
import { db } from "../libs/db.js";
import { sendOTP } from "../libs/mailer.js";
import { generateOTP } from "../libs/otp.js";
import { uploadCloudinary } from "../libs/cloudinary.js";

const { UserRole } = pkg;

/* ========================= REGISTER (WITHOUT OTP) ========================= */
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  let profileImage = null;

  try {
    if (req.file?.path) {
      const uploadedImage = await uploadCloudinary(req.file.path);
      profileImage = uploadedImage?.secure_url || null;
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === "admin@gmail.com" ? UserRole.ADMIN : UserRole.USER;

    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        image: profileImage,
      },
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "70d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

/* ========================= REQUEST SIGNUP OTP ========================= */
export const requestSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📧 OTP request for:", email);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.emailOtp.deleteMany({ where: { email } });
    await db.emailOtp.create({
      data: { email, code, expiresAt },
    });

    const otpResult = await sendOTP(email, code);
    if (!otpResult.success) {
      await db.emailOtp.deleteMany({ where: { email } });
      return res.status(500).json({ error: "Failed to send OTP" });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP request error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

/* ================= VERIFY OTP + REGISTER ================= */
export const verifySignupOtpAndRegister = async (req, res) => {
  try {
    const { email, code, username, password } = req.body;
    let profileImage = null;

    if (!email || !code || !username || !password) {
      return res
        .status(400)
        .json({ error: "email, code, username and password required" });
    }

    if (req.file?.path) {
      const uploadedImage = await uploadCloudinary(req.file.path);
      profileImage = uploadedImage?.secure_url || null;
    }

    const otp = await db.emailOtp.findFirst({
      where: { email, code, consumed: false },
    });

    if (!otp) return res.status(400).json({ error: "Invalid OTP" });
    if (otp.expiresAt < new Date())
      return res.status(400).json({ error: "OTP expired" });

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === "admin@gmail.com" ? UserRole.ADMIN : UserRole.USER;

    const newUser = await db.user.create({
      data: {
        email,
        name: username,
        password: hashedPassword,
        role,
        image: profileImage,
      },
    });

    await db.emailOtp.update({
      where: { id: otp.id },
      data: { consumed: true },
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "70d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP or register" });
  }
};

/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};

/* ========================= LOGOUT ========================= */
export const logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  res.status(200).json({ message: "Logout successful" });
};

/* ========================= CHECK AUTH ========================= */
export const check = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User authenticated",
    user: req.user,
  });
};
