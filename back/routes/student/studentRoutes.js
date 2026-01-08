import { Router } from 'express';

import studentController from '../../controllers/student/studentController.js';

const router = Router();

router.post('/', studentController.store);
router.get('/:matricula', studentController.show);
router.get('/', studentController.index);
router.delete('/:id', studentController.remove);

export default router;