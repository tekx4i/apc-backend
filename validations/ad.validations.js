import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_AD_ID,
	GET_AD_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getAdSchema = yup.object({
	query: createQueryParamsSchema(GET_AD_QUERY_SCHEMA_CONFIG),
});

export const addAdSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		description: yup.string().required(REQUIRED_FIELDS),
		status: yup.string().default('PENDING'),
		duration: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.oneOf([15, 30], 'Duration must be 15 or 30'),
	}),
	file: yup.mixed(),
});

export const updateAdSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		description: yup.string().notRequired(),
		status: yup.string().notRequired(),
		duration: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.notRequired()
			.oneOf([15, 30], 'Duration must be 15 or 30'),
	}),
	params: yup.object({
		id: yup
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
	}),
	file: yup.mixed(),
});

export const AdIdSchema = yup.object({
	params: yup.object({
		id: yup
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
	}),
});

export const deleteAdsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS).of(
			yup.number().positive().integer(INTEGER_ERROR).required(REQUIRED_FIELDS).test({
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
		),
	}),
});
