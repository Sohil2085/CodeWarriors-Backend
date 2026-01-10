import express from "express";
import {
  check,
  login,
  logout,
  register,
  requestSignupMagicLink,
  verifySignupMagicLinkAndRegister,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const authRoutes = express.Router();

/* ========================= REGISTER (DIRECT – NO MAGIC LINK) ========================= */
authRoutes.post(
  "/register",
  upload.single("profileImage"),
  register
);

/* ========================= MAGIC LINK SIGNUP ========================= */

// Step 1: Request magic link
authRoutes.post(
  "/register/request-magic-link",
  requestSignupMagicLink
);

// Step 2: Verify magic link + complete signup
authRoutes.post(
  "/register/verify-magic-link",
  upload.single("profileImage"),
  verifySignupMagicLinkAndRegister
);

/* ========================= LOGIN ========================= */
authRoutes.post("/login", login);

/* ========================= LOGOUT ========================= */
authRoutes.post("/logout", authMiddleware, logout);

/* ========================= CHECK AUTH ========================= */
authRoutes.get("/check", authMiddleware, check);

export default authRoutes;
