import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import generator from 'generate-password';
import db from '../../dbClient';

import config from '../../config';
import { User } from '@prisma/client';
import MailService from '../shared/services/mail';

interface AuthToken {
  email: string;
  role: string;
  id: number;
  fullName: string;
}

const algorithm = 'aes-256-ctr';
const secretKey = config.encryptSecret;

const getHashedPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, 8);
  return hashedPassword;
};

const generateAuthToken = (payload: AuthToken): string => {
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: '1d',
  });

  return token;
};

const verifyPassword = async (
  hash: { content: string; iv: string },
  password: string
): Promise<boolean> => {
  const originalPassword = decrypt(hash);
  return originalPassword === password;
};

const encrypt = (text: string) => {
  const iv = crypto.randomBytes(16);

  console.log('secretKey', secretKey);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  };
};

const decrypt = (hash: { iv: string; content: string }) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, 'hex')
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);

  return decrpyted.toString();
};

const generateRandomPassword = (): string => {
  return generator.generate({
    length: 10,
    numbers: true,
  });
};

const sendInvitationMail = async (user: User, password: string) => {
  const fromEmail = config.gmailEmail;
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

  const info = await MailService.send(
    fromName,
    fromEmail,
    toList,
    subject,
    text,
    html
  );
};

const isAdmin = async (userId: number): Promise<boolean> => {
  const admin = db.user.findFirst({ where: { id: userId } });
  return admin !== undefined;
};

const incrementNumberOfWorkingProjects = async (adminId: number) => {
  await db.user.update({
    where: { id: adminId },
    data: { numberOfActiveProjects: { increment: 1 } },
  });
};

const decrementNumberOfWorkingProjects = async (adminId: number) => {
  await db.user.update({
    where: { id: adminId },
    data: { numberOfActiveProjects: { decrement: 1 } },
  });
};

export default {
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
};
