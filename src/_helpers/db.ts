import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';
import loadConfig, { DatabaseConfig } from './config';

const db: any = {};
export default db;

const fileConfig = loadConfig();

async function initialize() {
    const { host, port, user, password, database, ssl } = getDatabaseConfig();
    const connection = await mysql.createConnection({ host, port, user, password });

    if (process.env.NODE_ENV !== 'production' && host === 'localhost') {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    }

    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        dialectOptions: ssl ? { ssl: { rejectUnauthorized: false } } : undefined
    });

    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    await sequelize.sync();
}

function getDatabaseConfig(): DatabaseConfig {
    if (process.env.NODE_ENV === 'production') {
        const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter((name) => !process.env[name]);
        if (requiredEnvVars.length) {
            throw new Error(`${requiredEnvVars.join(', ')} environment variable(s) required in production`);
        }
    }

    const localDatabase: Partial<DatabaseConfig> = fileConfig.database || {};

    const config = {
        host: process.env.DB_HOST || localDatabase.host,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : (localDatabase.port || 3306),
        user: process.env.DB_USER || localDatabase.user,
        password: process.env.DB_PASSWORD || localDatabase.password,
        database: process.env.DB_NAME || localDatabase.database,
        ssl: process.env.DB_SSL === 'true' || localDatabase.ssl === true
    };

    if (!config.host || !config.port || !config.user || !config.database) {
        throw new Error('Database configuration is missing');
    }

    return config as DatabaseConfig;
}

initialize();
