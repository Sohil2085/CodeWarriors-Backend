import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pkg from "@prisma/client";
import { db } from "../libs/db.js";
import { sendMagicLink } from "../libs/mailer.js";
import { uploadCloudinary } from "../libs/cloudinary.js";

const { UserRole } = pkg;

/* ========================= REGISTER (WITHOUT MAGIC LINK) ========================= */
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

/* ========================= REQUEST SIGNUP MAGIC LINK ========================= */
export const requestSignupMagicLink = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("📧 Magic link request for:", email);

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.magicLinkToken.deleteMany({ where: { email } });

        await db.magicLinkToken.create({
            data: {
                email,
                token,
                expiresAt,
            },
        });

        const result = await sendMagicLink(email, token);
        if (!result.success) {
            return res.status(500).json({ error: "Failed to send magic link" });
        }

        res.status(200).json({ message: "Magic link sent successfully" });
    } catch (error) {
        console.error("Magic link request error:", error);
        res.status(500).json({ error: "Failed to send magic link" });
    }
};

/* ================= VERIFY MAGIC LINK + REGISTER ================= */
export const verifySignupMagicLinkAndRegister = async (req, res) => {
    try {
        const { token, username, password } = req.body;
        let profileImage = null;

        if (!token || !username || !password) {
            return res.status(400).json({
                error: "token, username and password are required",
            });
        }

        if (req.file?.path) {
            const uploadedImage = await uploadCloudinary(req.file.path);
            profileImage = uploadedImage?.secure_url || null;
        }

        const record = await db.magicLinkToken.findUnique({
            where: { token },
        });

        if (!record || record.used) {
            return res.status(400).json({ error: "Invalid or used magic link" });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).json({ error: "Magic link expired" });
        }

        const existingUser = await db.user.findUnique({
            where: { email: record.email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role =
            record.email === "admin@gmail.com"
                ? UserRole.ADMIN
                : UserRole.USER;

        const newUser = await db.user.create({
            data: {
                email: record.email,
                name: username,
                password: hashedPassword,
                role,
                image: profileImage,
            },
        });

        await db.magicLinkToken.update({
            where: { id: record.id },
            data: { used: true },
        });

        const jwtToken = jwt.sign(
            { id: newUser.id },
            process.env.JWT_SECRET,
            { expiresIn: "70d" }
        );

        res.cookie("jwt", jwtToken, {
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
        console.error("Verify magic link error:", error);
        res.status(500).json({ error: "Failed to verify magic link or register" });
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
