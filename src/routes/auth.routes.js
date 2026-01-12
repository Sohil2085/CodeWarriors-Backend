import express from "express";
import {
    check,
    login,
    logout,
    register,
    googleCallback,
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
    googleCallback
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
