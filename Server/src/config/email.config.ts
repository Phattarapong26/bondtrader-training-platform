// src/config/email.config.ts

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ตรวจสอบว่ามีการตั้งค่า environment variables ครบหรือไม่
const validateEnvVariables = () => {
    const required = ['SMTP_USER', 'SMTP_PASS', 'OTP_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

// สร้าง email transporter
export const createEmailTransporter = () => {
    validateEnvVariables();
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// สร้าง email template สำหรับ OTP
export const createOTPEmailTemplate = (otp: string) => {
    return {
        subject: 'รหัส OTP สำหรับรีเซ็ตรหัสผ่าน',
        html: `
            <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">รหัส OTP สำหรับรีเซ็ตรหัสผ่าน</h2>
                <p>รหัส OTP ของคุณคือ: <strong style="font-size: 24px; color: #0066cc;">${otp}</strong></p>
                <p>รหัสนี้จะหมดอายุใน 5 นาที</p>
                <p style="color: #666; font-size: 14px;">หากคุณไม่ได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
        `
    };
};