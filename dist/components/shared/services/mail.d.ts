import SMTPTransport from 'nodemailer/lib/smtp-transport';
declare type SendEmailType = (fromName: string, fromEmail: string, toList: string[], subject: string, text: string, html?: string) => Promise<SMTPTransport.SentMessageInfo>;
declare const MailService: {
    send: SendEmailType;
};
export default MailService;
//# sourceMappingURL=mail.d.ts.map