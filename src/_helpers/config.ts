import fs from 'fs';
import path from 'path';

export type SmtpOptions = {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
        user: string;
        pass: string;
    };
};

export type DatabaseConfig = {
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
    ssl?: boolean;
};

export type FileConfig = {
    database?: DatabaseConfig;
    secret?: string;
    emailFrom?: string;
    smtpOptions?: SmtpOptions;
};

export default function loadConfig(): FileConfig {
    if (process.env.NODE_ENV === 'production') return {};

    const configPath = path.resolve(__dirname, '../../config.json');
    if (!fs.existsSync(configPath)) return {};

    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}
