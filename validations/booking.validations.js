import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import { addHours, startOfDay, endOfDay } from 'date-fns';
import {
	INVALID_AD_ID,
	REQUIRED_FIELDS,
	INVALID_BOOKING_ID,
	INVALID_LOCATION_ID,
	GET_BOOKING_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getBookingSchema = yup.object({
	query: createQueryParamsSchema(GET_BOOKING_QUERY_SCHEMA_CONFIG),
});

export const getAvailableBookingSchema = yup.object({
	query: yup.object({
		location: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_LOCATION_ID,
				async test(value) {
					const record = await prisma.apc_locations.findUnique({
						where: {
							is_deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		start_date: yup
			.date()
			.required(REQUIRED_FIELDS)
			.test(
			  	'is-future-5h',
			  	'start_date must be at least 4 hours from now',
			  	value => {
					const nowPlus24Hours = addHours(new Date(), 4);
					return value >= nowPlus24Hours;
			  	}
			)
			.transform(value => (value ? startOfDay(value) : value)), // Set time to 00:00:00
		end_date: yup
			.date()
			.required(REQUIRED_FIELDS)
			.min(yup.ref('start_date'), 'end_date must be after start_date')
			.transform(value => (value ? endOfDay(value) : value)),
		duration: yup.number().notRequired(),
	}),
});

export const addBookingSchema = yup.object({
	body: yup.object({
		ad_id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_AD_ID,
				async test(value) {
					const record = await prisma.apc_ads.findUnique({
						where: {
							is_deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		location_id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_LOCATION_ID,
				async test(value) {
					const record = await prisma.apc_locations.findUnique({
						where: {
							is_deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		start_date: yup
			.date()
			.required(REQUIRED_FIELDS)
			.test(
			  '	is-future-5h',
			  	'start_date must be at least 4 hours from now',
			  	value => {
					const nowPlus24Hours = addHours(new Date(), 4);
					return value >= nowPlus24Hours;
			  	}
			)
			.transform(value => (value ? startOfDay(value) : value)), // Set time to 00:00:00
		end_date: yup
			.date()
			.required(REQUIRED_FIELDS)
			.min(yup.ref('start_date'), 'end_date must be after start_date')
			.transform(value => (value ? endOfDay(value) : value)),
		duration: yup.number().notRequired(),
	}),
});

export const updateBookingSchema = yup.object({
	body: yup.object({
		status: yup.string().notRequired(),
	}),
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_BOOKING_ID,
				async test(value) {
					const record = await prisma.apc_ads_booking.findUnique({
						where: {
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const BookingIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_BOOKING_ID,
				async test(value) {
					const record = await prisma.apc_ads_booking.findUnique({
						where: {
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deleteBookingsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
