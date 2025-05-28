import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_PAYMENT_ID,
	INVALID_BOOKING_ID,
	INVALID_PACKAGE_ID,
	GET_PAYMENT_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getPaymentSchema = yup.object({
	query: createQueryParamsSchema(GET_PAYMENT_QUERY_SCHEMA_CONFIG),
});

export const addPaymentSchema = yup.object({
	body: yup.object({
		package_id: yup.number().required(REQUIRED_FIELDS).test({
			name: 'valid-package',
			message: INVALID_PACKAGE_ID,
			async test(value) {
				const record = await prisma.apc_packages.findUnique({
					where: { 
						id: value,
						is_deleted: false,
					},
				});
				return !record || !record.id ? Boolean(0) : Boolean(1);
			},
		}),
		method: yup.string().default('stripe'),
		booking_ids: yup.array().of(
			yup.number().required(REQUIRED_FIELDS).test({
				name: 'valid-booking',
				message: INVALID_BOOKING_ID,
				async test(value) {
					const record = await prisma.apc_ads_booking.findUnique({
						where: { 
							id: value, 
							// status: 'PENDING' 
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		).required(REQUIRED_FIELDS),
	}),
});

export const updatePaymentSchema = yup.object({
	body: yup.object({
		paymentIntentId: yup.string().required(),
	}),
});

export const PaymentIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_PAYMENT_ID,
				async test(value) {
					const record = await prisma.apc_payments.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deletePaymentsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
