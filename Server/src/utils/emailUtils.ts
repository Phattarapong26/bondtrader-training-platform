import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()
console.log("user:", process.env.SMTP_USER,"pass:",process.env.SMTP_PASS);
// Create the transporter using Gmail's SMTP service
export const transporter = nodemailer.createTransport({
  service: "gmail", // Use the Gmail service to simplify SMTP configuration
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use your app password if 2FA is enabled
  },
});
// Function to send OTP email
export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to:", email);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
