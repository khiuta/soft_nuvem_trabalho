import { Router } from 'express';

import studentController from '../../controllers/student/studentController';

const router = Router();

router.post('/', studentController.store);
router.get('/:id', studentController.indexOne);

export default router;