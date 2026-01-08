import { Router } from 'express';

import bookController from '../../controllers/management/bookController.js'

const router = Router();

router.post('/', bookController.store);
router.get('/', bookController.index);
router.put('/remove', bookController.remove);
router.get('/test', bookController.test_index);
router.get('/:id', bookController.show);


export default router;