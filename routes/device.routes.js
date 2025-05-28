import { Router } from 'express';

import {
	getDevice,
	createDevice,
	updateDevice,
	deleteDevice,
	getDeviceByMac,
	getAllDevices,
	deleteManyDevice,
} from '../controllers';
import { validate, isAdmin } from '../middlewares';
import {
	getDeviceSchema,
	addDeviceSchema,
	DeviceIdSchema,
	updateDeviceSchema,
	deleteDevicesSchema,
} from '../validations';

const router = Router();

router.get('/', isAdmin, validate(getDeviceSchema), getAllDevices);
router.get('/:id', isAdmin, validate(DeviceIdSchema), getDevice);
router.get('/mac/:mac', isAdmin, getDeviceByMac);
router.post('/', isAdmin, validate(addDeviceSchema), createDevice);
router.put('/:id', isAdmin, validate(updateDeviceSchema), updateDevice);
router.delete('/:id', isAdmin, validate(DeviceIdSchema), deleteDevice);
router.delete(
	'/',
	isAdmin,
	validate(deleteDevicesSchema),
	deleteManyDevice,
);

export const DeviceRoutes = router;
