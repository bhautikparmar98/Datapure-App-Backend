import { Router } from 'express';
import auth from '../../middlewares/auth';
import * as controller from './controller';

const router = Router();

// authentication
router.use(auth);

router.delete('/:id', controller.deleteImageComment);

export default router;
