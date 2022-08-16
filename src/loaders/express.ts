import { json } from 'body-parser';
import { errors } from 'celebrate';
import cors from 'cors';
import express from 'express';
import { ApiRoutes } from '../api';
import config from '../config';

export default ({ app }: { app: express.Application }): void => {
  //load cors
  app.use(
    cors({
      origin: '*',
    })
  );

  // Middleware that transforms the raw string of req.body into json
  app.use(json());

  // Load API routes
  app.use(config.api.prefix, ApiRoutes());

  app.use('/', (req, res) => {
    res.status(200).json({ live: true });
  });

  // handle errors from 'celebrate'
  app.use(errors());

  /// catch 404 and forward to error handler
  // app.use((req, res, next) => {
  //   const err: FlexibleObject = new Error('Not Found')
  //   err['status'] = 404
  //   next(err)
  // })
};
