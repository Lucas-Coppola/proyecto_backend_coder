import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.MONGO_URL;
const dbUser = process.env.ADMIN_USER;
const dbPass = process.env.ADMIN_PASS;
const dbPort = process.env.PORT;
const dbSecretSession = process.env.DB_SECRET_SESSION;
const dbPersistence = process.env.PERSISTENCE;
const dbEnvironment = process.env.ENVIRONMENT;
const dbMailPass = process.env.GMAIL_PASS;
const dbMailUser = process.env.GMAIL_USER;

export const envConfig = {
    dbUrl,
    dbUser,
    dbPass,
    dbPort,
    dbSecretSession,
    dbPersistence,
    dbEnvironment,
    dbMailPass,
    dbMailUser
};