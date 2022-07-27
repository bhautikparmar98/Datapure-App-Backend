import { Router } from 'express';
// import auth from '../../utils/auth';
import upload from '../../utils/upload';
import * as controller from './controller';

const router = Router();

router.post('/', upload.single('image'), controller.getOCR);

export default router;
