import { Router } from 'express';

import {
	getAllSpices,
	getSpice,
	createSpice,
	updateSpice,
	deleteSpice,
	deleteManySpice,
} from '../controllers';
import { validate, isAuth } from '../middlewares';
import {
	getSpiceSchema,
	addSpiceSchema,
	SpiceIdSchema,
	updateSpiceSchema,
	deleteSpicesSchema,
} from '../validations';

const router = Router();

router.get('/', isAuth, validate(getSpiceSchema), getAllSpices);
router.get('/:id', isAuth, validate(SpiceIdSchema), getSpice);
router.post('/', isAuth, validate(addSpiceSchema), createSpice);
router.put('/:id', isAuth, validate(updateSpiceSchema), updateSpice);
router.delete('/:id', isAuth, validate(SpiceIdSchema), deleteSpice);
router.delete(
	'/',
	isAuth,
	validate(deleteSpicesSchema),
	deleteManySpice,
);

export const SpiceRoutes = router;
