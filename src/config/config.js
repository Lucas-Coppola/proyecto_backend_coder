import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.MONGO_URL;
const dbUser = process.env.ADMIN_USER;
const dbPass = process.env.ADMIN_PASS;
const dbPort = process.env.PORT;
const dbSecretSession = process.env.DB_SECRET_SESSION

export const envConfig = {
    dbUrl,
    dbUser,
    dbPass,
    dbPort,
    dbSecretSession
}