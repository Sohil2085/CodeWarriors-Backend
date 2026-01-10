import axios from "axios";

export const sendMagicLink = async (email, token) => {
  const link = `https://code-warriors-lyart.vercel.app/verify?token=${token}`;

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.BREVO_EMAIL,
          name: "Your App",
        },
        to: [{ email }],
        subject: "Verify your email",
        htmlContent: `
          <h2>Email Verification</h2>
          <p>Click the button below to verify your email:</p>
          <a href="${link}" style="padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;">
            Verify Email
          </a>
          <p>This link expires in 10 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Magic link email error:", error.response?.data || error.message);
    return { success: false };
  }
};
