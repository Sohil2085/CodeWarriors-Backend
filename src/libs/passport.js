import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db.js";
import pkg from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const { UserRole } = pkg;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,

        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const name = profile.displayName;
                const image = profile.photos[0].value;

                // Check if user exists
                let user = await db.user.findUnique({ where: { email } });

                if (!user) {
                    // Create new user
                    user = await db.user.create({
                        data: {
                            email,
                            name,
                            image,
                            role: UserRole.USER,
                            password: "", // No password for Google users
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
