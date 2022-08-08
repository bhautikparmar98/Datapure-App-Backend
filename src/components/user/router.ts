import { celebrate } from 'celebrate';
import { Router } from 'express';
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

router.get('/:id/password', controller.getPassword);
router.get('/:id/project', controller.getClientsProjects);
router.get(
  '/clients',
  accessControlMiddleware.check({
    resource: 'user',
    action: 'read',
  }),
  controller.getClients
);

router.get(
  '/admins',
  accessControlMiddleware.check({
    resource: 'admin',
    action: 'read',
  }),
  controller.getAdmins
);

export default router;
