import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

async function sendMail(recipient, subject, text) {
    const transporter = nodemailer.createTransport({
        port: 587,
        service: "gmail",
        auth: {
            user: EMAIL_USERNAME,
            pass: EMAIL_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: '"Wishlist Team 👻" <support@wishlist.com>',
        to: recipient,
        subject: subject,
        text: text,
    });

    console.log("Message sent: %s", info.messageId);
}

export default sendMail;
