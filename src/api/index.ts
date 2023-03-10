import { Router } from 'express';

import OCRRouter from '../components/ocr/router';
import UserRouter from '../components/user/router';
import ImageRouter from '../components/image/router';
import ProjectRouter from '../components/project/router';
import ImageCommentRouter from '../components/comments/router';

export const ApiRoutes = (): Router => {
  const app = Router();

  app.get('/health', async (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/ocr', OCRRouter);
  app.use('/user', UserRouter);
  app.use('/image', ImageRouter);
  app.use('/project', ProjectRouter);
  app.use('/imageComment', ImageCommentRouter);

  return app;
};
