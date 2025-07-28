import bcrypt from "bcryptjs";
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";

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