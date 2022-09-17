import mongoose from 'mongoose';
import { Db } from 'mongodb';
import config from '../config';
import LoggerInstance from './logger';

export default async (): Promise<any> => {
  try {
    // connect to mongo db through the url provided in the env file
    const connection = await mongoose.connect(config.mongoDatabaseURL);
    return connection.connection.db;
  } catch (error) {
    LoggerInstance.log('error', 'Unable to connect with mongo');
  }
};
