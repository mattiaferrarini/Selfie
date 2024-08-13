import nodemailer from 'nodemailer';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({path: './.env.local'});

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

export async function sendEmailWithAttachments(to: string, subject: string, text: string, attachments: any, deleteAttachments: boolean = false) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
        attachments: attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
        if (deleteAttachments) {
            for (let attachment of attachments) {
                fs.unlinkSync(attachment.path);
            }
        }
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}