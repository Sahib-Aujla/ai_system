import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  
  host: "smtp-relay.brevo.com",
  port: 587,
  secure:false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendMail(email, subject, content) {
  const mailOptions = {
    from:  process.env.EMAIL,
    to: email,
    html: content,
    subject: subject,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);

    console.log("Email sent: ", info);
  });
}
