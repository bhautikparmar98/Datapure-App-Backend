"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../../config"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.default.gmailEmail,
        pass: config_1.default.gmailAppPassword,
    },
});
const send = async (fromName, fromEmail, toList, subject, text, html) => {
    const from = `"${fromName}" <${fromEmail}>`;
    const to = toList.join(', ');
    return await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
    });
};
const MailService = { send };
exports.default = MailService;
