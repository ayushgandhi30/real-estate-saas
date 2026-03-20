const nodemailer = require("nodemailer");

const sendEmail = async (to, link) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Password Reset",
        html: `<p>Click here to reset password:</p>
           <a href="${link}">${link}</a>`,
    });
};

module.exports = sendEmail;