import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_LOCATION_ID,
	GET_LOCATION_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getLocationSchema = yup.object({
	query: createQueryParamsSchema(GET_LOCATION_QUERY_SCHEMA_CONFIG),
});

export const addLocationSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		lat_long: yup.string().required(REQUIRED_FIELDS),
	}),
});

export const updateLocationSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		lat_long: yup.string().notRequired(),
	}),
	params: yup.object({
		id: yup
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
	}),
});

export const LocationIdSchema = yup.object({
	params: yup.object({
		id: yup
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
	}),
});

export const deleteLocationsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
