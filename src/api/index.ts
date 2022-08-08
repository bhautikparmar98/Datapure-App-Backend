import { Router } from 'express';

import UserRouter from '../components/user/router';
import OCRRouter from '../components/ocr/router';
import ImageRouter from '../components/image/router';
import ProjectRouter from '../components/project/router';

export const ApiRoutes = (): Router => {
  const app = Router();

  app.get('/health', async (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/ocr', OCRRouter);
  app.use('/user', UserRouter);
  app.use('/image', ImageRouter);
  app.use('/project', ProjectRouter);

  return app;
};
