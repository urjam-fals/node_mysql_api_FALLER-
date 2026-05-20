import nodemailer from 'nodemailer';
import loadConfig, { SmtpOptions } from './config';

type EmailParams = {
    to: string;
    subject: string;
    html: string;
};

const fileConfig = loadConfig();

export default async function sendEmail({ to, subject, html }: EmailParams) {
    const transporter = nodemailer.createTransport(getSmtpOptions());

    await transporter.sendMail({
        from: getEmailFrom(),
        to,
        subject,
        html
    });
}

function getEmailFrom() {
    if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
    if (!fileConfig.emailFrom) throw new Error('EMAIL_FROM environment variable is required');
    return fileConfig.emailFrom;
}

function getSmtpOptions() {
    if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST) {
        throw new Error('SMTP_HOST environment variable is required in production to send emails');
    }

    if (process.env.SMTP_HOST) {
        const options: SmtpOptions = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
            secure: process.env.SMTP_SECURE === 'true'
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            options.auth = {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            };
        }

        return options;
    }

    if (!fileConfig.smtpOptions) throw new Error('SMTP configuration is missing');
    return fileConfig.smtpOptions;
}
