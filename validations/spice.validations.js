import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_SPICE_ID,
	GET_SPICE_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getSpiceSchema = yup.object({
	query: createQueryParamsSchema(GET_SPICE_QUERY_SCHEMA_CONFIG),
});

export const addSpiceSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		description: yup.string().required(REQUIRED_FIELDS),
	}),
});

export const updateSpiceSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		description: yup.string().notRequired(),
	}),
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_SPICE_ID,
				async test(value) {
					const record = await prisma.spices.findUnique({
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

export const SpiceIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_SPICE_ID,
				async test(value) {
					const record = await prisma.spices.findUnique({
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

export const deleteSpicesSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
