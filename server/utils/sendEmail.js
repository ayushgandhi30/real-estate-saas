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
        subject: "Password Reset Request - EstatePilot",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #555; font-size: 16px;">You requested a password reset for your EstatePilot account.</p>
                <p style="color: #555; font-size: 16px;">Click the button below to reset your password. This link will expire in 15 minutes.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${link}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
                </div>
                <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #999; font-size: 12px; word-break: break-all;">${link}</p>
            </div>
        `,
    });
};

module.exports = sendEmail;
