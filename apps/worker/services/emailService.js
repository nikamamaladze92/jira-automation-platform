const nodemailer = require("nodemailer");

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`missing ENV variable: ${name}`);
  }
  return value;
}

const transporter = nodemailer.createTransport({
  host: getRequiredEnv("SMTP_HOST"),
  port: Number(getRequiredEnv("SMTP_PORT")),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: {
    user: getRequiredEnv("SMTP_USER"),
    pass: getRequiredEnv("SMTP_PASS"),
  },
});

exports.sendEmail = async ({ to, subject, text, html }) => {
  const res = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return {
    messageId: res.messageId,
    accepted: res.accepted,
    rejected: res.rejected,
  };
};
