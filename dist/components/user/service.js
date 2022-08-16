"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const generate_password_1 = __importDefault(require("generate-password"));
const dbClient_1 = __importDefault(require("../../dbClient"));
const config_1 = __importDefault(require("../../config"));
const mail_1 = __importDefault(require("../shared/services/mail"));
const constants_1 = require("../../constants");
const algorithm = 'aes-256-ctr';
const secretKey = config_1.default.encryptSecret;
const getHashedPassword = async (password) => {
    const hashedPassword = await bcryptjs_1.default.hash(password, 8);
    return hashedPassword;
};
const generateAuthToken = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, config_1.default.jwtSecret, {
        expiresIn: '1d',
    });
    return token;
};
const verifyPassword = async (hash, password) => {
    const originalPassword = decrypt(hash);
    return originalPassword === password;
};
const encrypt = (text) => {
    const iv = crypto_1.default.randomBytes(16);
    console.log('secretKey', secretKey);
    const cipher = crypto_1.default.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
    };
};
const decrypt = (hash) => {
    const decipher = crypto_1.default.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    const decrpyted = Buffer.concat([
        decipher.update(Buffer.from(hash.content, 'hex')),
        decipher.final(),
    ]);
    return decrpyted.toString();
};
const generateRandomPassword = () => {
    return generate_password_1.default.generate({
        length: 10,
        numbers: true,
    });
};
const sendInvitationMail = async (user, password) => {
    const fromEmail = config_1.default.gmailEmail;
    const fromName = 'DataPureTech';
    const toList = [user.email];
    const subject = 'Invitation to sign in';
    const text = '';
    const html = `
    <h2> DataPure has invited you to join the platform. </h2>
    
    <br />
    <table style="border: 1px solid black; border-collapse: collapse;">
    <tbody >
      <tr >
        <td style="border: 1px solid black; border-collapse: collapse;">Email</td>
        <td style="border: 1px solid black; border-collapse: collapse;">${user.email}</td>
      </tr>
      <tr>
        <td style="border: 1px solid black; border-collapse: collapse;">Password</td>
        <td style="border: 1px solid black; border-collapse: collapse;">${password}</td>
      </tt>
    </tbody>
    </table>

    <br /> <br />
    <p><strong>DataPure</strong> Tech team</p>
  `;
    const info = await mail_1.default.send(fromName, fromEmail, toList, subject, text, html);
};
const isAdmin = async (userId) => {
    const admin = await dbClient_1.default.user.findFirst({ where: { id: userId } });
    return admin !== undefined && (admin === null || admin === void 0 ? void 0 : admin.role) === constants_1.Roles.ADMIN;
};
const isAnnotator = async (userId) => {
    const annotator = await dbClient_1.default.user.findFirst({ where: { id: userId } });
    return annotator !== undefined && (annotator === null || annotator === void 0 ? void 0 : annotator.role) === constants_1.Roles.ANNOTATOR;
};
const isQA = async (userId) => {
    const annotator = await dbClient_1.default.user.findFirst({ where: { id: userId } });
    return annotator !== undefined && (annotator === null || annotator === void 0 ? void 0 : annotator.role) === constants_1.Roles.QA;
};
const incrementNumberOfWorkingProjects = async (adminId) => {
    await dbClient_1.default.user.update({
        where: { id: adminId },
        data: { numberOfActiveProjects: { increment: 1 } },
    });
};
const decrementNumberOfWorkingProjects = async (adminId) => {
    await dbClient_1.default.user.update({
        where: { id: adminId },
        data: { numberOfActiveProjects: { decrement: 1 } },
    });
};
exports.default = {
    getHashedPassword,
    generateAuthToken,
    verifyPassword,
    encrypt,
    decrypt,
    generateRandomPassword,
    sendInvitationMail,
    isAdmin,
    incrementNumberOfWorkingProjects,
    decrementNumberOfWorkingProjects,
    isAnnotator,
    isQA,
};
