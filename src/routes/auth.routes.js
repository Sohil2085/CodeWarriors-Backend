import express from "express";
import { check, login, logout, register, requestSignupOtp, verifySignupOtpAndRegister } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";


const authRoutes = express.Router();


authRoutes.post("/register",upload.single("profileImage"), register);
authRoutes.post("/register/request-otp", requestSignupOtp);
authRoutes.post("/register/verify-otp", upload.single("profileImage"), verifySignupOtpAndRegister);

authRoutes.post("/login", login);

authRoutes.post("/logout",authMiddleware ,logout);

authRoutes.get("/check",authMiddleware ,check);


export default authRoutes;