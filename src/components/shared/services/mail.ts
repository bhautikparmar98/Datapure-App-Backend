import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import config from '../../../config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmailEmail,
    pass: config.gmailAppPassword,
  },
});

type SendEmailType = (
  fromName: string,
  fromEmail: string,
  toList: string[],
  subject: string,
  text: string,
  html?: string
) => Promise<SMTPTransport.SentMessageInfo>;

const send: SendEmailType = async (
  fromName,
  fromEmail,
  toList,
  subject,
  text,
  html?
) => {
  const from = `"${fromName}" <${fromEmail}>`;
  const to = toList.join(', ');

  return await transporter.sendMail({
    from, // sender address
    to, // list of receivers
    subject, // Subject line
    text, // plain text body
    html, // html body
  });
};

const MailService = { send };

export default MailService;
