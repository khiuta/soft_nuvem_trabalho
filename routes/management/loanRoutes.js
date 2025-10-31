import { Router } from 'express'

import loanController from '../../controllers/management/loanController';

const router = Router();

router.get('/', loanController.index);
router.post('/', loanController.store);

export default router;