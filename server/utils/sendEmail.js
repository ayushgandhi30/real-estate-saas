const nodemailer = require("nodemailer");

const sendEmail = async (to, link) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // Verify connection before sending
    await transporter.verify();

    await transporter.sendMail({
        from: `"EstatePilot" <${process.env.EMAIL}>`,
        to,
        subject: `Password Reset Request - EstatePilot [${new Date().toLocaleTimeString()}]`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Password Reset OTP</h2>
                <p style="color: #555; font-size: 16px;">You requested a password reset for your EstatePilot account.</p>
                <p style="color: #555; font-size: 16px;">Use the One-Time Password (OTP) below to reset your password.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #f8f9fa; border: 2px dashed #e74c3c; color: #333; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 32px; letter-spacing: 6px; display: inline-block;">
                        ${link}
                    </div>
                </div>
                <p style="color: #999; font-size: 13px;">This OTP will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
        `,
    });
};

module.exports = sendEmail;
