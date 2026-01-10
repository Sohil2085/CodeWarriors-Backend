import nodemailer from "nodemailer";

export const sendOTP = async (email, code) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    await transporter.verify(); // confirm SMTP connection

    const mailOptions = {
      from: `"Your App Name" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${code}</h1>
        <p>Valid for 10 minutes</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("❌ Brevo Email Error:", error);
    return { success: false, error: error.message };
  }
};
