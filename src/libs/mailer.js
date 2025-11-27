import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // smtp.gmail.com
  port: process.env.EMAIL_PORT,       // 587
  secure: false,                      // MUST be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailer connection failed:", error);
  } else {
    console.log("✅ Mailer is ready to send emails");
  }
});

// Send mail function
export const sendOTP = async (to, code) => {
  try {
    // Validate email
    if (!to || !to.includes("@")) {
      console.error("❌ Invalid email address:", to);
      return { success: false, error: "Invalid email address" };
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #007bff; letter-spacing: 5px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: "Your OTP Code for Email Verification",
      html,
    });

    console.log("📩 Email sent successfully to:", to, "Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error for recipient:", to);
    console.error("Error Details:", error.message);
    console.error("Error Code:", error.code);
    return { success: false, error: error.message };
  }
};
