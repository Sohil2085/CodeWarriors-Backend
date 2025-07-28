import jwt from 'jsonwebtoken';
import { db } from '../libs/db.js';

export const authMiddleware = async (req,res,next) => {
    const token = req.cookies.jwt;

    try {
        if(!token){
            res.status(401).json({
                message : "Unauthorized - No token Provided"
            })
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                message : "Unauthorized - No token Provided"
            })
        }

        const user = await db.user.findUnique({
            where : {
                id : decoded.id
            },
            select : {
                id : true,
                name : true,
                email : true,
                role : true,
                image : true
            }
        })


        if(!user){
            res.status(404).json({message : "User not found"})
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error authentication",error);
        res.status(500).json({message : "Error authentication"});
    }
}

