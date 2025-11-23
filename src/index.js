import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import problemRoutes from "./routes/problem.routes.js";



dotenv.config()

const app = express();
app.use(
  cors({
    origin: ["https://code-warriors-lyart.vercel.app","http://localhost:5173"],   // your frontend domain
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());



app.get("/",(req,res)=>{
    res.send("Hello to CodeWarriors 🔥");
})


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/v1/problems", problemRoutes);



app.listen(process.env.PORT,() => {
    console.log("Server is Running on Port " + process.env.PORT);
})