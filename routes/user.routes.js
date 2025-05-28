import { Router } from 'express';

import {
	getUser,
	createUser,
	updateUser,
	deleteUser,
	getAllUsers,
	updateManyUser,
	deleteManyUser,
	getDashboardStats,
} from '../controllers';
import { validate, isAuth, isAdmin,upload } from '../middlewares';
import {
	getUsersSchema,
	registerSchema,
	userIdSchema,
	updateUserSchema,
	deleteUsersSchema,
	updateManyUserSchema,
} from '../validations';

const router = Router();

router.get('/', isAuth, validate(getUsersSchema), getAllUsers);
router.get('/stats', isAuth, getDashboardStats);
router.get('/:id', isAuth, validate(userIdSchema), getUser);
router.post('/', isAuth, validate(registerSchema), createUser);
router.put(
	'/:id', 	
	upload.single('image'), 
	isAuth, 
	validate(updateUserSchema), 
	updateUser
);
router.put('/', isAdmin, validate(updateManyUserSchema), updateManyUser);
router.delete('/:id', isAdmin, validate(userIdSchema), deleteUser);
router.delete('/', isAdmin, validate(deleteUsersSchema), deleteManyUser);

export const userRoutes = router;
