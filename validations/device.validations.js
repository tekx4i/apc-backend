import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	REQUIRED_FIELDS,
	INVALID_DEVICE_ID,
	INVALID_LOCATION_ID,
	GET_DEVICE_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getDeviceSchema = yup.object({
	query: createQueryParamsSchema(GET_DEVICE_QUERY_SCHEMA_CONFIG),
});

export const addDeviceSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		ip: yup.string().required(REQUIRED_FIELDS),
		info: yup.string().required(REQUIRED_FIELDS),
		status: yup.string().default('PENDING'),
		location_id: yup.number().positive().integer(INTEGER_ERROR).required(REQUIRED_FIELDS).test({
			name: 'valid-location',
			message: INVALID_LOCATION_ID,
			async test(value) {
				const record = await prisma.apc_locations.findUnique({
					where: {
						is_deleted: false,
						id: parseInt(value, 10),
					},
				});
				return !record || !record.id ? Boolean(0) : Boolean(1);
			}
		})
	}),
});

export const updateDeviceSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		ip: yup.string().notRequired(),
		info: yup.string().notRequired(),
		status: yup.string().notRequired(),
		location_id: yup.number().positive().integer(INTEGER_ERROR).notRequired().test({
			name: 'valid-location',
			message: INVALID_LOCATION_ID,
			async test(value) {
				if (!value) return Boolean(1);
				
				const record = await prisma.apc_locations.findUnique({
					where: {
						is_deleted: false,
						id: parseInt(value, 10),
					},
				});
				return !record || !record.id ? Boolean(0) : Boolean(1);
			}
		})
	}),
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_DEVICE_ID,
				async test(value) {
					const record = await prisma.apc_devices.findUnique({
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

export const DeviceIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_DEVICE_ID,
				async test(value) {
					const record = await prisma.apc_devices.findUnique({
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

export const deleteDevicesSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
