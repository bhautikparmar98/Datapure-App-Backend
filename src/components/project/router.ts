import { celebrate } from 'celebrate';
import { Router } from 'express';
import { Actions, Resources } from '../../constants';
import accessControlMiddleware from '../../middlewares/ac';
import auth from '../../middlewares/auth';
import * as controller from './controller';
import {
  AddImageToProjectSchema,
  AssignAdminsToProjectSchema,
  AssignQAToProjectSchema,
  CreateProject,
  AssignAnnotatorsToProjectSchema,
  CreatePreAnnotatedProjectSchema,
} from './validate';

const router = Router();

// authentication
router.use(auth);

router.post('/', celebrate({ body: CreateProject }), controller.createProject);
router.post(
  '/preAnnotated',
  celebrate({ body: CreatePreAnnotatedProjectSchema }),
  controller.createPreAnnotatedProject
);
router.get('/:id/images', controller.getProjectImages);
router.get('/:id/annotator/images', controller.getAnnotatorImagesForProject);
router.get('/:id/qa/images', controller.getQAImagesForProject);
router.get('/:id/client/review/images', controller.getClientImagesForProject);

router.post(
  '/:id/images',
  celebrate({ body: AddImageToProjectSchema }),
  controller.addImages
);
router.put(
  '/:id/assign/admin',
  celebrate({ body: AssignAdminsToProjectSchema }),
  accessControlMiddleware.check({
    resource: 'admin',
    action: 'read',
  }),
  controller.assignAdminToProject
);

router.put('/:id/assign/qa', controller.assignQAsToProject);

router.put('/:id/assign/annotator', controller.assignAnnotatorsToProject);
router.get(
  '/:id/download',
  accessControlMiddleware.check({
    resource: Resources.OUTPUT_FILE,
    action: Actions.READ,
  }),
  controller.downloadOutputFile
);

export default router;
