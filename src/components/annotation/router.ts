import { Router } from 'express';
import auth from '../../middlewares/auth';

const router = Router();

// authentication
router.use(auth);

export default router;
