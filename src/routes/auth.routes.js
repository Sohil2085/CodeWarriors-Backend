import express from "express";
import {
    check,
    login,
    logout,
    register,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

import passport from "passport";
import jwt from "jsonwebtoken";

const authRoutes = express.Router();

/* ========================= GOOGLE AUTH ========================= */
authRoutes.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

authRoutes.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/`);
    }
);

/* ========================= REGISTER (DIRECT – NO MAGIC LINK) ========================= */
authRoutes.post(
    "/register",
    upload.single("profileImage"),
    register
);

/* ========================= LOGIN ========================= */
authRoutes.post("/login", login);

/* ========================= LOGOUT ========================= */
authRoutes.post("/logout", authMiddleware, logout);

/* ========================= CHECK AUTH ========================= */
authRoutes.get("/check", authMiddleware, check);

export default authRoutes;
