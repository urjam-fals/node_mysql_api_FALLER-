import config from '../../config.json';
import nodemailer from 'nodemailer';

export default async function sendEmail({to, subject, html, from = config.emailFrom}){
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.sendMail({from, to, subject, html});
}