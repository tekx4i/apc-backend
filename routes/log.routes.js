import { Router } from 'express';

import {
	getLog,
	createLog,
	getAllLogs,
	createMultipleLog,
	// updateLog,
	// deleteLog,
	// deleteManyLog,
} from '../controllers';
import { validate, isAuth } from '../middlewares';
import {
	LogIdSchema,
	getLogSchema,
	addLogSchema,
	addMultipleLogSchema,
	// updateLogSchema,
	// deleteLogsSchema,
} from '../validations';

const router = Router();

router.get('/', isAuth, validate(getLogSchema), getAllLogs);
router.get('/:id', isAuth, validate(LogIdSchema), getLog);
router.post('/:macAddress', validate(addLogSchema), createLog);
router.post('/:macAddress/multiple', validate(addMultipleLogSchema), createMultipleLog);
// router.put('/:id', isAuth, validate(updateLogSchema), updateLog);
// router.delete('/:id', isAuth, validate(LogIdSchema), deleteLog);
// router.delete('/', isAuth, validate(deleteLogsSchema), deleteManyLog);

export const LogRoutes = router;
