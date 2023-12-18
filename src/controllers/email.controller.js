import { GMAIL_USER } from '../config/configs.js';
import EmailService from '../services/emailservice.js';

const emailService = new EmailService();

export const sendEmailDelete = (req, res) => {
    try {
        const { email } = req.user;
        const { message, title } = req.body;

        emailService.sendEmail(email, message, title, (error, info) => {
            if (error) {
                res.status(400).send({ message: "Error", payload: error });
            }
            req.logger.console.info(`Message sent: %s ${info.messageId}`);
            res.send({ message: "Success!", payload: info });
        });
    } catch (error) {
        req.logger.console.warn(`Send email error:  ${error} `);
        res.status(500).send({ error: error, message: "Could not send email from:" + GMAIL_USER });
    }
};