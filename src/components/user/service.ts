import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import generator from 'generate-password';
import db from '../../dbClient';

import config from '../../config';
import { User } from '@prisma/client';
import MailService from '../shared/services/mail';
import { Roles } from '../../constants';

interface AuthToken {
  email: string;
  role: string;
  id: number;
  fullName: string;
}

const algorithm = 'aes-256-ctr';
const secretKey = config.encryptSecret;

// generate hashed password
const getHashedPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, 8);
  return hashedPassword;
};

// generate auth token
const generateAuthToken = (payload: AuthToken): string => {
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: '1d',
  });

  return token;
};

// verify the password
const verifyPassword = async (
  hash: { content: string; iv: string },
  password: string
): Promise<boolean> => {
  const originalPassword = decrypt(hash);
  return originalPassword === password;
};

// encrypt the password
const encrypt = (text: string) => {
  // create the iv
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  };
};

// decrypt the the password
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

// send invitation email
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

  // send the email
  const info = await MailService.send(
    fromName,
    fromEmail,
    toList,
    subject,
    text,
    html
  );
};

// check if the user is admin
const isAdmin = async (userId: number): Promise<boolean> => {
  const admin = await db.user.findFirst({ where: { id: userId } });
  return admin !== undefined && admin?.role === Roles.ADMIN;
};

// check if the user is annotator
const isAnnotator = async (userId: number): Promise<boolean> => {
  const annotator = await db.user.findFirst({ where: { id: userId } });
  return annotator !== undefined && annotator?.role === Roles.ANNOTATOR;
};

// check if the user is qa
const isQA = async (userId: number): Promise<boolean> => {
  const annotator = await db.user.findFirst({ where: { id: userId } });
  return annotator !== undefined && annotator?.role === Roles.QA;
};

// increment the number of the working projects
const incrementNumberOfWorkingProjects = async (adminId: number) => {
  await db.user.update({
    where: { id: adminId },
    data: { numberOfActiveProjects: { increment: 1 } },
  });
};

// decrement the number of the working projects
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
  isAnnotator,
  isQA,
};
