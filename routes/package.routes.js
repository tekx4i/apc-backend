import { Router } from 'express';

import {
	getAllPackages,
	getPackage,
	createPackage,
	updatePackage,
	deletePackage,
	deleteManyPackage,
} from '../controllers';
import { validate, isAuth, isAdmin } from '../middlewares';
import {
	getPackageSchema,
	addPackageSchema,
	PackageIdSchema,
	updatePackageSchema,
	deletePackagesSchema,
} from '../validations';

const router = Router();

router.get('/', isAuth, validate(getPackageSchema), getAllPackages);
router.get('/:id', isAuth, validate(PackageIdSchema), getPackage);
router.post('/', isAdmin, validate(addPackageSchema), createPackage);
router.put('/:id', isAdmin, validate(updatePackageSchema), updatePackage);
router.delete('/:id', isAdmin, validate(PackageIdSchema), deletePackage);
router.delete(
	'/',
	isAdmin,
	validate(deletePackagesSchema),
	deleteManyPackage,
);

export const PackageRoutes = router;
