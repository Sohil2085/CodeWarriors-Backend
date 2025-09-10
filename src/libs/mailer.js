import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(toEmail, otpCode) {
  const info = await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: "Your CodeWarriors verification code",
    text: `Your verification code is ${otpCode}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <b>${otpCode}</b>. It expires in 10 minutes.</p>`,
  });
  return info;
}


