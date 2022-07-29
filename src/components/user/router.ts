import { celebrate } from 'celebrate';
import { Router } from 'express';
import * as controller from './controller';
import { UserRegistrationSchema } from './validate';

const router = Router();

router.post(
  '/register',
  celebrate({ body: UserRegistrationSchema }),
  controller.registerClient
);

export default router;
