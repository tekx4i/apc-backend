import { Router } from 'express';

import {
	getAllRoles,
	getRole,
	createRole,
	updateRole,
	deleteRole,
	deleteManyRole,
} from '../controllers';
import { validate, isAuth, isAdmin } from '../middlewares';
import {
	getRoleSchema,
	addRoleSchema,
	RoleIdSchema,
	updateRoleSchema,
	deleteRolesSchema,
} from '../validations';

const router = Router();
//isAdmin
router.get('/', validate(getRoleSchema), getAllRoles);
router.get('/:id', isAuth, validate(RoleIdSchema), getRole);
router.post('/', isAdmin,validate(addRoleSchema), createRole);
router.put('/:id', isAdmin, validate(updateRoleSchema), updateRole);
router.delete('/:id', isAdmin, validate(RoleIdSchema), deleteRole);
router.delete('/', isAdmin, validate(deleteRolesSchema), deleteManyRole);

export const RoleRoutes = router;
