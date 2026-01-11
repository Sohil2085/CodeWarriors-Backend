import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pkg from "@prisma/client";
import { db } from "../libs/db.js";
import { uploadCloudinary } from "../libs/cloudinary.js";

const { UserRole } = pkg;

/* ========================= REGISTER ========================= */
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
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Error creating user" });
  }
};

/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Error logging in" });
  }
};

/* ========================= GOOGLE OAUTH CALLBACK ========================= */
export const googleCallback = async (req, res) => {
  try {
    const user = req.user; // set by passport

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // IMPORTANT for Render + Vercel
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    return res.redirect(process.env.FRONTEND_URL); // HOME PAGE
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
};

/* ========================= LOGOUT ========================= */
export const logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  return res.status(200).json({ message: "Logout successful" });
};

/* ========================= CHECK AUTH ========================= */
export const check = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User authenticated",
    user: req.user,
  });
};
