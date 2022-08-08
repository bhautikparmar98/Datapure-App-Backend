import { celebrate } from 'celebrate';
import { Router } from 'express';
import accessControlMiddleware from '../../middlewares/ac';
import auth from '../../middlewares/auth';
import * as controller from './controller';
import {
  AddImageToProjectSchema,
  AssignAdminsToProjectSchema,
  CreateProject,
} from './validate';

const router = Router();

// authentication
router.use(auth);

router.post('/', celebrate({ body: CreateProject }), controller.createProject);
router.get('/:id/images', controller.getProjectImages);
router.post(
  '/:id/images',
  celebrate({ body: AddImageToProjectSchema }),
  controller.addImages
);
router.put(
  '/:id/assign',
  celebrate({ body: AssignAdminsToProjectSchema }),
  accessControlMiddleware.check({
    resource: 'admin',
    action: 'read',
  }),
  controller.assignAdminsToProjects
);

export default router;
