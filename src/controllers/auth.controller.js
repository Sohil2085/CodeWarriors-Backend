import bcrypt from "bcryptjs";
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../libs/mailer.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    const profileImage = req.file?.filename;

    console.log(req.body)
    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
                }
        })

        if(existingUser){
            return res.status(400).json({
                error : "User Aready Exist"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const role = email == "admin@gmail.com" ? UserRole.ADMIN : UserRole.USER;

        const newUser = await db.user.create({
            data:{
                email,
                name : req.body.username,
                password:hashedPassword,
                role: role,
                image : profileImage || null
            }
        })
        console.log(newUser)
        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET,{
            expiresIn: "70d"
        })

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge:1000 * 60 * 60 * 24 * 7 //7 days
        })

        res.status(201).json({
            message:"User created Successfully",
            user:{
                id:newUser.id,
                name:newUser.name,
                email:newUser.email,
                role:newUser.role,
                image:newUser.image
            }
        })

        console.log(name)
        
    } catch (error) {
        console.log("Error creating user", error);
        res.status(500).json({
            error: "Error creating user"
        })
    }
}

export const requestSignupOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Upsert OTP for this email
        await db.emailOtp.deleteMany({ where: { email } });
        await db.emailOtp.create({ data: { email, code, expiresAt } });

        await sendOtpEmail(email, code);
        return res.status(200).json({ message: "OTP sent" });
    } catch (error) {
        console.log("Error sending OTP", error);
        return res.status(500).json({ error: "Failed to send OTP" });
    }
}

export const verifySignupOtpAndRegister = async (req, res) => {
    try {
        const { email, code, username, password } = req.body;
        const profileImage = req.file?.filename;
        
        if (!email || !code || !password || !username) {
            return res.status(400).json({ error: "email, code, username and password are required" });
        }

        const otp = await db.emailOtp.findFirst({ where: { email, code, consumed: false } });
        if (!otp) return res.status(400).json({ error: "Invalid code" });
        if (otp.expiresAt < new Date()) return res.status(400).json({ error: "Code expired" });

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email == "admin@gmail.com" ? UserRole.ADMIN : UserRole.USER;

        const newUser = await db.user.create({
            data: {
                email,
                name: username,
                password: hashedPassword,
                role,
                image: profileImage || null,
            },
        });

        await db.emailOtp.update({ where: { id: otp.id }, data: { consumed: true } });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "70d" });
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        return res.status(201).json({
            message: "User created Successfully",
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, image: newUser.image },
        });
    } catch (error) {
        console.log("Error verifying OTP/registering user", error);
        return res.status(500).json({ error: "Failed to verify code or create user" });
    }
}

export const login = async (req, res) => {
    const {email,password} = req.body;


    try {
        const user = await db.user.findUnique({
            where:{
                email
            }
        })

        if(!user){
            return res.status(401).json({
                error : "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({
                error : "Invalid credentials"
            })
        }

        const token = jwt.sign({id:user.id}, process.env.JWT_SECRET,{
            expiresIn : "7d"
        })

        res.cookie("jwt", token, {
            success : true,
            httpOnly: true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge:1000 * 60 * 60 * 24 * 7 //7 days
        })

        res.status(200).json({
            message:"User logged in Successfully",
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
                image:user.image
            }
        })

    } catch (error) {
        console.log("Error Logging in user", error);
        res.status(500).json({
            error: "Error Logging in user"
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt",{
            success : true,
            httpOnly: true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
        })

        res.status(200).json({
            success : true,
            message : "User Logout Successfully"
        })
    } catch (error) {
        console.log("Error Logging out user", error);
        res.status(500).json({
            error: "Error Logging out user"
        })
    }
}

export const check = async (req, res) => {
    try {
        res.status(200).json({
            success : true,
            message : "User Authenticated Successfully",
            user : req.user
        })
    } catch (error) {
        console.log("Error Checking user", error);
        res.status(500).json({
            error: "Error Checking user"
        })
    }
}