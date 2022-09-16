import { json } from 'body-parser';
import { errors } from 'celebrate';
import cors from 'cors';
import express from 'express';
import { ApiRoutes } from '../api';
import config from '../config';

export default ({ app }: { app: express.Application }): void => {
  //load cors and only allow cors for the provided url in the config.
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

  // create a health check end point to check the working of APIs.
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
