import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Create a reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});


console.log('Email config:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USERNAME,
});

// Verify connection configuration
transporter.verify()
  .then(() => console.log('Email service is ready'))
  .catch(err => console.error('Error with email service:', err));

export const sendEmail = async (options: EmailOptions) => {
  try {
    const mailOptions = {
      from: `"Campus Shuttle System" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string) => {
  // Get just the first 6 characters of the token for the reset code
  const resetCode = resetToken.substring(0, 6);
  
  await sendEmail({
    to: email,
    subject: 'Your password reset code (valid for 10 minutes)',
    text: `Hello ${name},\n\nYou requested a password reset for your Campus Shuttle account.\n\nYour password reset code is: ${resetCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nCampus Shuttle Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello ${name},</p>
        <p>You requested a password reset for your Campus Shuttle account.</p>
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,<br>Campus Shuttle Team</p>
      </div>
    `
  });
};