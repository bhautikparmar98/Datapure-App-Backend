import express from 'express';
import expressLoader from './express';
import Logger from './logger';
import mongooseLoader from './mongoose';

export default async ({
  expressApp,
}: {
  expressApp: express.Application;
}): Promise<void> => {
  // call the mongo database loader.
  await mongooseLoader();
  Logger.info('✌️ Mongodb loaded and connected');

  // call the express loader.
  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
