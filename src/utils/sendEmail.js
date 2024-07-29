import { createTransport } from "nodemailer";
import { envConfig } from "../config/config.js";

const transport = createTransport({
    service: 'gmail',
    port: 578,
    auth: {
        user: envConfig.dbMailUser,
        pass: envConfig.dbMailPass
    }
});

export const sendEmail = async ({userMail, subject, html}) => {
    return await transport.sendMail({
        from: 'coppolalucascai@gmail.com',
        to: userMail,
        subject,
        html
    });
}