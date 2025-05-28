import { Router } from 'express';

import {
	getAllPayments,
	getPayment,
	createPayment,
	updatePayment,
	deletePayment,
	deleteManyPayment,
} from '../controllers';
import { validate, isAuth, isAdmin } from '../middlewares';
import {
	getPaymentSchema,
	addPaymentSchema,
	PaymentIdSchema,
	updatePaymentSchema,
	deletePaymentsSchema,
} from '../validations';

const router = Router();

router.get('/', isAuth, validate(getPaymentSchema), getAllPayments);
router.get('/:id', isAuth, validate(PaymentIdSchema), getPayment);
router.post('/', isAuth, validate(addPaymentSchema), createPayment);
router.put('/', isAuth, validate(updatePaymentSchema), updatePayment);
router.delete('/:id', isAuth, validate(PaymentIdSchema), deletePayment);
router.delete(
	'/',
	isAuth,
	validate(deletePaymentsSchema),
	deleteManyPayment,
);

export const PaymentRoutes = router;
