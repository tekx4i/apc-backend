import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_PACKAGE_ID,
	GET_PACKAGE_QUERY_SCHEMA_CONFIG,
	INTEGER_ERROR,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getPackageSchema = yup.object({
	query: createQueryParamsSchema(GET_PACKAGE_QUERY_SCHEMA_CONFIG),
});

export const addPackageSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		description: yup.string().notRequired(),
		duration: yup.number().positive().integer(INTEGER_ERROR).required(REQUIRED_FIELDS),
		price: yup.number().positive().required(REQUIRED_FIELDS),
		status: yup.string().default('ACTIVE'),
	}),
});

export const updatePackageSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		description: yup.string().notRequired(),
		duration: yup.number().positive().integer(INTEGER_ERROR).notRequired(),
		price: yup.number().positive().notRequired(),
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
				message: INVALID_PACKAGE_ID,
				async test(value) {
					const record = await prisma.apc_packages.findUnique({
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

export const PackageIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_PACKAGE_ID,
				async test(value) {
					const record = await prisma.apc_packages.findUnique({
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

export const deletePackagesSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
