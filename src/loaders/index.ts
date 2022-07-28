import express from 'express';
import expressLoader from './express';
import Logger from './logger';
import mongooseLoader from './mongoose';

export default async ({
  expressApp,
}: {
  expressApp: express.Application;
}): Promise<void> => {
  await mongooseLoader();
  Logger.info('✌️ Mongodb loaded and connecteddd');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};

