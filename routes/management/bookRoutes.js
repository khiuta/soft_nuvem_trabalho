import { Router } from 'express';

import bookController from '../../controllers/management/bookController.js'

const router = Router();

router.post('/', bookController.store);
router.get('/', bookController.index);
router.get('/:id', bookController.show);

export default router;