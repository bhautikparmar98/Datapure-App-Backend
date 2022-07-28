import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import { ApiRoutes } from '../api';
import config from '../config';

export default ({ app }: { app: express.Application }): void => {
  //load cors
  app.use(
    cors({
      credentials: true,
      origin: config.clientURL,
    })
  );

  // Middleware that transforms the raw string of req.body into json
  app.use(json());

  // Load API routes
  app.use(config.api.prefix, ApiRoutes());

  /// catch 404 and forward to error handler
  // app.use((req, res, next) => {
  //   const err: FlexibleObject = new Error('Not Found')
  //   err['status'] = 404
  //   next(err)
  // })
};
