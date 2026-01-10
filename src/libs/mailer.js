import axios from "axios";

export const sendMagicLink = async (email, token) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.BREVO_EMAIL,
          name: "Your App",
        },
        to: [{ email }],
        subject: "Verify your email",
        htmlContent: `<a href="${process.env.FRONTEND_URL}/verify?token=${token}">
                        Click to verify
                      </a>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY, // 🔥 REQUIRED
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Brevo messageId:", response.data?.messageId);
    return { success: true };
  } catch (error) {
    console.error(
      "Magic link email error:",
      error.response?.data || error.message
    );
    return { success: false };
  }
};
