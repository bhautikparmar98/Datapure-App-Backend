import { celebrate } from 'celebrate';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import * as controller from './controller';
import { ImageSignSchema } from './validate';

const router = Router();

// authentication
router.use(auth);

router.post('/sign', celebrate({ body: ImageSignSchema }), controller.signUrl);
router.put('/:id/annotation/finish', controller.finishAnnotation);

export default router;
