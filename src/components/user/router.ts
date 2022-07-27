import { Router } from 'express';
import auth from '../../utils/auth';
import * as controller from './controller';

const router = Router();

router.post('/create', controller.createUser);
router.post('/login', controller.loginUser);
router.post('/logout', controller.logoutUser);
router.get('/profile', auth, controller.getProfile);
router.patch('/edit', auth, controller.updateUser);
router.delete('/delete', auth, controller.deleteUser);

export default router;
