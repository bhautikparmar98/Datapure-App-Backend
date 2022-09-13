import { Router } from 'express';
import auth from '../../middlewares/auth';
import * as controller from './controller';

const router = Router();

// authentication
router.use(auth);

// DELETE /api/imageComment/:id
// map this api to this contoller
router.delete('/:id', controller.deleteImageComment);

export default router;
