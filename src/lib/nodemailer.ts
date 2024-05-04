import nodemailer from "nodemailer";

const {MAIL_HOST, MAIL_USER, MAIL_PASS} = process.env;

export const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });