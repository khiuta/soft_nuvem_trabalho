import { Router } from 'express';

import managerController from '../../controllers/management/managerController.js';

const router = Router();

router.get('/', managerController.index);
router.post('/', managerController.store);

export default router;