import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	INVALID_AD_ID,
	REQUIRED_FIELDS,
	INVALID_DEVICE_ID,
	INVALID_PLAYLIST_ID,
	GET_PLAYLIST_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getPlaylistSchema = yup.object({
	query: createQueryParamsSchema(GET_PLAYLIST_QUERY_SCHEMA_CONFIG),
});

export const getCurrentPlaylistSchema = yup.object({
	query: yup.object({
		device_id: yup.number().integer().notRequired(),
		mac_address: yup.string().notRequired(),
		location_id: yup.number().integer().notRequired(),
	}),
});

export const addPlaylistSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		description: yup.string().notRequired(),
		start_at: yup.date().required(REQUIRED_FIELDS),
		end_at: yup.date().required(REQUIRED_FIELDS),
		ads: yup.array().of(
			yup.number().integer().required(REQUIRED_FIELDS)
			.test(
				'is-valid-ad', 
				INVALID_AD_ID, 
				async value => {
					if (!value) return false;
					const record = await prisma.apc_ads.findUnique({
						where: {
							id: parseInt(value, 10),
							is_deleted: false,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				}
			),
		).required(REQUIRED_FIELDS),
		devices: yup.array().of(
			yup.number().integer().required(REQUIRED_FIELDS)
			.test(
				'is-valid-device', 
				INVALID_DEVICE_ID, 
				async value => {
					if (!value) return false;
					const record = await prisma.apc_devices.findUnique({
						where: {
							id: parseInt(value, 10),
							is_deleted: false,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				}
			),
		).required(REQUIRED_FIELDS),
		status: yup.string().default('PENDING'),
	}),
});

export const updatePlaylistSchema = yup.object({
	body: yup.object({
		name: yup.string().notRequired(),
		description: yup.string().notRequired(),
		start_at: yup.date().notRequired(),
		end_at: yup.date().notRequired(),
		ads: yup.array().of(
			yup.number().integer().required(REQUIRED_FIELDS)
			.test(
				'is-valid-adminOption', 
				INVALID_AD_ID, 
				async value => {
					if (!value) return false;
					const record = await prisma.apc_ads.findUnique({
						where: {
							id: parseInt(value, 10),
							is_deleted: false,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				}
			),
		).notRequired(),
		devices: yup.array().of(
			yup.number().integer().required(REQUIRED_FIELDS)
			.test(
				'is-valid-device', 
				INVALID_DEVICE_ID, 
				async value => {
					if (!value) return false;
					const record = await prisma.apc_devices.findUnique({
						where: {
							id: parseInt(value, 10),
							is_deleted: false,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				}
			),
		).notRequired(),
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
				message: INVALID_PLAYLIST_ID,
				async test(value) {
					const record = await prisma.apc_play_list.findUnique({
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

export const PlaylistIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_PLAYLIST_ID,
				async test(value) {
					const record = await prisma.apc_play_list.findUnique({
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

export const deletePlaylistsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
