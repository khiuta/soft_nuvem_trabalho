import { Router } from 'express';

import studentController from '../../controllers/student/studentController';

const router = Router();

router.post('/', studentController.store);
router.get('/:matricula', studentController.show);
router.get('/', studentController.index);

export default router;