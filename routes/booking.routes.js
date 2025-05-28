import { Router } from 'express';

import {
	getBooking,
	createBooking,
	updateBooking,
	// deleteBooking,
	getAllBookings,
	// deleteManyBooking,
	getAllAvailableBookings,
} from '../controllers';
import { validate, isAuth } from '../middlewares';
import {
	getBookingSchema,
	addBookingSchema,
	BookingIdSchema,
	updateBookingSchema,
	// deleteBookingsSchema,
	getAvailableBookingSchema,
} from '../validations';

const router = Router();

router.get('/available', isAuth, validate(getAvailableBookingSchema), getAllAvailableBookings);
router.get('/', isAuth, validate(getBookingSchema), getAllBookings);
router.get('/:id', isAuth, validate(BookingIdSchema), getBooking);
router.post('/', isAuth, validate(addBookingSchema), createBooking);
router.put('/:id', isAuth, validate(updateBookingSchema), updateBooking);
// router.delete('/:id', isAuth, validate(BookingIdSchema), deleteBooking);
// router.delete('/', isAuth, validate(deleteBookingsSchema), deleteManyBooking);

export const BookingRoutes = router;
