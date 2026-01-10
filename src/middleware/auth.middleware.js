import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" }); // ✅ RETURN
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" }); // ✅ RETURN
    }

    req.user = user;
    return next(); // ✅ only next if everything is OK
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" }); // ✅ RETURN
  }
};
