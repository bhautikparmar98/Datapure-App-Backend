import { celebrate } from 'celebrate';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import * as controller from './controller';
import { ImageSignSchema } from './validate';

const router = Router();

// authentication
router.use(auth);

export default router;
