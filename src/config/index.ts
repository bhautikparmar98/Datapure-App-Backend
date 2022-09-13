/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from 'dotenv';
// dotenv will silently fail on GitHub Actions, otherwise this breaks deployment
dotenv.config();

// export config as javascript object
export default {
  application: {
    port: process.env.PORT || '3000',
    env: process.env.NODE_ENV,
    isTest: process.env.NODE_ENV! === 'test',
    isDev:
      process.env.NODE_ENV! === 'dev' ||
      process.env.NODE_ENV! === 'development',
    isHeroku: process.env.HEROKU_APP_NAME ? true : false,
    workers: process.env.WEB_CONCURRENCY || 1,
  },
  logs: {
    level: process.env.LOG_LEVEL || 'info',
  },
  api: {
    prefix: '/api',
  },
  databaseURL: process.env.MONGODB_URI!,
  clientURL: process.env.CLIENT_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET!,
  encryptSecret: process.env.ENCRYPT_SECRET!,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD!,
  gmailEmail: process.env.GMAIL_EMAIL!,
  mongoDatabaseURL: process.env.MONGO_DATABASE_URL!,
  sqlDatabaseURL: process.env.SQL_DATABASE_URL!,
  aws: {
    keyId: process.env.AWS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    s3: {
      bucket: process.env.S3_BUCKET!,
      region: process.env.S3_REGION!,
    },
  },
};
