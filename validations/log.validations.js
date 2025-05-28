import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_LOG_ID,
	INVALID_DEVICE_ID,
	GET_LOG_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getLogSchema = yup.object({
	query: createQueryParamsSchema(GET_LOG_QUERY_SCHEMA_CONFIG),
});

export const addLogSchema = yup.object({
	body: yup.object({
		play_list_name: yup.string().required(REQUIRED_FIELDS),
		temperature: yup.number().required(REQUIRED_FIELDS),
		log_time: yup.date().required(REQUIRED_FIELDS),
		description: yup.string().notRequired(),
		active_time: yup.string().notRequired(),
	}),
	params: yup.object({
		macAddress: yup.string().required(REQUIRED_FIELDS),
	}),
});

export const addMultipleLogSchema = yup.object({
	body: yup.array().required(REQUIRED_FIELDS).of(yup.object({
		play_list_name: yup.string().required(REQUIRED_FIELDS),
		temperature: yup.number().required(REQUIRED_FIELDS),
		log_time: yup.date().required(REQUIRED_FIELDS),
		description: yup.string().notRequired(),
		active_time: yup.string().notRequired(),
	})),
	params: yup.object({
		macAddress: yup.string().required(REQUIRED_FIELDS),
	}),
});
export const updateLogSchema = yup.object({
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
				message: INVALID_LOG_ID,
				async test(value) {
					const record = await prisma.apc_device_logs.findUnique({
						where: {
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const LogIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_LOG_ID,
				async test(value) {
					const record = await prisma.apc_device_logs.findUnique({
						where: {
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deleteLogsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
