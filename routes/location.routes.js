import { Router } from 'express';

import {
	getAllLocations,
	getLocation,
	createLocation,
	updateLocation,
	deleteLocation,
	deleteManyLocation,
} from '../controllers';
import { validate, isAdmin, isAuth } from '../middlewares';
import {
	getLocationSchema,
	addLocationSchema,
	LocationIdSchema,
	updateLocationSchema,
	deleteLocationsSchema,
} from '../validations';

const router = Router();

router.get('/', isAuth, validate(getLocationSchema), getAllLocations);
router.get('/:id', isAuth, validate(LocationIdSchema), getLocation);
router.post('/', isAdmin, validate(addLocationSchema), createLocation);
router.put('/:id', isAdmin, validate(updateLocationSchema), updateLocation);
router.delete('/:id', isAdmin, validate(LocationIdSchema), deleteLocation);
router.delete(
	'/',
	isAdmin,
	validate(deleteLocationsSchema),
	deleteManyLocation,
);

export const LocationRoutes = router;
