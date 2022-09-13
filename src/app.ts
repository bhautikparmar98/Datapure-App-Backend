import express from 'express';
import loader from './loaders';

// create express app
export const app = express();

// pass express app to the loader
loader({ expressApp: app });
