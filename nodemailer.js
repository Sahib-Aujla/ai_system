import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  pool: true,
  service: "hotmail",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  maxConnections: 1,
});

export async function sendEmail(email, subject, content) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    html: content,
    subject: subject,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);

    console.log("Email sent: ", info);
  });
}
