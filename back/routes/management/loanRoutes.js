import { Router } from 'express'

import loanController from '../../controllers/management/loanController.js';

const router = Router();

router.get('/', loanController.index);
router.post('/', loanController.store);
router.put('/return/:id', loanController.devolution);

export default router;