import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const dotenv_path = path.join(__dirname, '../.env.local');
dotenv.config({path: dotenv_path});

consol.log('EMAIL_USER:', process.env.EMAIL_USER);

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
    },
});

// Function to send an email
export async function sendEmail(to: string, subject: string, text: string) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

export async function sendEmailWithAttachments(to: string, subject: string, text: string, attachments: any) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
        attachments: attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}