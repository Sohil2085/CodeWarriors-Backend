import cron from "node-cron";
import { db } from "../libs/db.js";

export const cleanupExpiredTokens = () => {
    // Run every hour: '0 * * * *'
    cron.schedule("0 * * * *", async () => {
        try {
            console.log("Running expired magic link token cleanup...");
            const now = new Date();

            const result = await db.magicLinkToken.deleteMany({
                where: {
                    expiresAt: {
                        lt: now,
                    },
                },
            });

            console.log(`Cleanup complete. Deleted ${result.count} expired tokens.`);
        } catch (error) {
            console.error("Error during token cleanup:", error);
        }
    });
};
