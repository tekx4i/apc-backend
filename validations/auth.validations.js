import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INVALID_EMAIL,
	PASSWORD_MIN_LENGTH,
	EMAIL_EXISTS,
	REQUIRED_FIELDS,
	GENDERS,
	INVALID_DATE_FORMAT,
	INVALID_GENDER,
	ALL_ROLES,
	ALL_STATUS,
	INVALID_ROLE,
	USER_NOT_FOUND,
	INVALID_STATUS,
	GET_USER_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const loginSchema = yup.object().shape({
	body: yup.object().shape({
		email: yup.string().email(INVALID_EMAIL).required(),
		password: yup
			.string()
			.required(REQUIRED_FIELDS)
			.min(6, PASSWORD_MIN_LENGTH),
		role: yup.string().notRequired().oneOf(ALL_ROLES, INVALID_ROLE),
	}),
});

export const getUsersSchema = yup.object({
	query: createQueryParamsSchema(GET_USER_QUERY_SCHEMA_CONFIG),
});

export const registerSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: EMAIL_EXISTS,
				async test(value) {
					const record = await prisma.apc_users.findFirst({
						where: {
							// is_deleted: 0,
							email: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		password: yup.string().required().min(6),
		role_id: yup
			.number()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_ROLE,
				async test(value) {
					if (value === 1) return Boolean(0);
					const record = await prisma.apc_roles.findFirst({
						where: {
							is_deleted: 0,
							id: value,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		number: yup.string().notRequired(),
		birth_date: yup
			.string()
			.notRequired()
			.matches(/^\d{4}-\d{2}-\d{2}$/, INVALID_DATE_FORMAT),
		gender: yup.string().notRequired().oneOf(GENDERS, INVALID_GENDER),
		address: yup.string().notRequired(),
		postal_code: yup.string().notRequired(),
		city: yup.string().notRequired(),
		state: yup.string().notRequired(),
		country: yup.string().notRequired(),
		skip_payment: yup.boolean().notRequired(),
	}),
});

export const verifySchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.apc_users.findFirst({
						where: {
							is_deleted: 0,
							id: parseInt(value, 10),
							status: {
								not: 'BLOCKED',
							},
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	body: yup.object({
		otp: yup.string().min(4).max(4).required(REQUIRED_FIELDS),
	}),
});

export const userIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.apc_users.findFirst({
						where: {
							is_deleted: 0,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const resendOTPSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.apc_users.findFirst({
						where: {
							is_deleted: 0,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	query: yup.object({
		type: yup.string().notRequired(),
	}),
});

export const updateUserSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		number: yup.string().notRequired(),
		password: yup.string().notRequired().min(6),
		birth_date: yup
			.string()
			.notRequired()
			.matches(/^\d{4}-\d{2}-\d{2}$/, INVALID_DATE_FORMAT),
		gender: yup.string().notRequired().oneOf(GENDERS, INVALID_GENDER),
		status: yup.string().notRequired().oneOf(ALL_STATUS, INVALID_STATUS),
		address: yup.string().notRequired(),
		postal_code: yup.string().notRequired(),
		city: yup.string().notRequired(),
		state: yup.string().notRequired(),
		country: yup.string().notRequired(),
		approved: yup.boolean().notRequired(),
		password: yup.string().notRequired().min(6),
		role_id: yup
			.number()
			.notRequired()
			.test({
				name: 'valid-form',
				message: INVALID_ROLE,
				async test(value) {
					if(!value) return Boolean(1);
					
					const record = await prisma.apc_roles.findFirst({
						where: {
							is_deleted: 0,
							id: value,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		skip_payment: yup.boolean().notRequired(),
	}),
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.apc_users.findFirst({
						where: {
							is_deleted: 0,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	file: yup.mixed(),
});

export const updateManyUserSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
		status: yup
			.string()
			.required(REQUIRED_FIELDS)
			.oneOf(ALL_STATUS, INVALID_STATUS),
	}),
});

export const forgotSchema = yup.object({
	body: yup.object({
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.apc_users.findFirst({
						where: {
							is_deleted: 0,
							email: value,
							status: {
								not: 'BLOCKED',
							},
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const resetSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.apc_users.findFirst({
						where: {
							is_deleted: 0,
							id: parseInt(value, 10),
							status: {
								not: 'BLOCKED',
							},
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	body: yup.object({
		password: yup.string().required(REQUIRED_FIELDS).min(6),
	}),
});

export const deleteUsersSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
