import express from "express";
import { check, login, logout, register } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";


const authRoutes = express.Router();


authRoutes.post("/register",upload.single("profileImage"), register);

authRoutes.post("/login", login);

authRoutes.post("/logout",authMiddleware ,logout);

authRoutes.get("/check",authMiddleware ,check);


export default authRoutes;