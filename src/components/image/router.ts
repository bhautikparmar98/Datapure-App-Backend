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
router.put('/:id/annotation/redo', controller.redoHandler);
router.put('/:id/annotation/approve', controller.qaApproveAnnotation);
router.put('/:id/approve', controller.qaApproveAnnotation);

export default router;
