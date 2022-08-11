import { celebrate } from 'celebrate';
import { Router } from 'express';
import { Actions, Resources } from '../../constants';
import accessControlMiddleware from '../../middlewares/ac';
import auth from '../../middlewares/auth';
import * as controller from './controller';
import {
  UserLoginSchema,
  UserRegistrationSchema,
  UserInviteSchema,
} from './validate';

const router = Router();

router.post(
  '/register',
  celebrate({ body: UserRegistrationSchema }),
  controller.registerClient
);

router.post('/login', celebrate({ body: UserLoginSchema }), controller.login);

// authentication
router.use(auth);

router.get('/', controller.getAllUsers);
router.post(
  '/invite',
  celebrate({ body: UserInviteSchema }),
  controller.inviteUser
);
router.get('/admin/project', controller.getAdminProjects);
router.get('/qa/project', controller.getQAProjects);
router.get('/annotator/project', controller.getAnnotatorProjects);

router.get(
  '/clients',
  accessControlMiddleware.check({
    resource: Resources.USER,
    action: Actions.READ,
  }),
  controller.getClients
);

router.get(
  '/admins',
  accessControlMiddleware.check({
    resource: Resources.ADMIN,
    action: Actions.READ,
  }),
  controller.getAdmins
);

router.get(
  '/qa',
  accessControlMiddleware.check({
    resource: Resources.QA,
    action: Actions.READ,
  }),
  controller.getQAs
);

router.get(
  '/annotator',
  accessControlMiddleware.check({
    resource: Resources.ANNOTATOR,
    action: Actions.READ,
  }),
  controller.getAnnotators
);

router.get('/:id/password', controller.getPassword);
router.get('/:id/project', controller.getClientsProjects);

export default router;
