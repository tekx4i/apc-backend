import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { LOG_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class LogService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllLogs() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
			//	deleted: false,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'device_id' || key === 'location_id' || key === 'play_list_id') {
					return { [key]: parseInt(search[key], 10) };
				}
				return { [key]: { contains: search[key] } };
			});
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.apc_device_logs.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			device: true,
			location: true,
			play_list: true,
		};

		const allRecords = await prisma.apc_device_logs.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(LOG_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getLog() {
		const { id } = this.req.params;
		const record = await prisma.apc_device_logs.findUnique({
			where: {
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(LOG_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createLog() {
		const { body, params } = this.req;
		const { macAddress } = params;
		const { 
			play_list_name: playListName, 
			temperature, 
			description, 
			log_time: logTime,
			active_time: activeTime,
		} = body;

		const device = await prisma.apc_devices.findFirst({
			where: {
				info: macAddress,
			},
		});

		if (!device || !device.id)
			throw new AppError(DEVICE_NOT_FOUND, HttpStatus.NOT_FOUND);

		const playList = await prisma.apc_play_list.findFirst({
			where: {
				video_url: playListName,
			},
		});

		if (!playList || !playList.id)
			throw new AppError(PLAY_LIST_NOT_FOUND, HttpStatus.NOT_FOUND);

		const record = await prisma.apc_device_logs.create({
			data: {
				device_id: device.id,
				location_id: device.location_id,
				play_list_id: playList.id,
				temperature: parseFloat(temperature),
				description: description || null,
				log_time: new Date(logTime),
				active_time: activeTime || null,
			},
		});

		await prisma.apc_play_list.update({
			where: { id: playList.id },
			data: { count: { increment: 1 } },
		});

		await prisma.apc_devices.update({
			where: { id: device.id },
			data: { 
				temperature: parseFloat(temperature),
				...(activeTime && { active_time: activeTime }),
			},
		});

		return { record };
	}

	async createMultipleLog() {
		const { body, params } = this.req;
		const { macAddress } = params;

		const device = await prisma.apc_devices.findFirst({
			where: {
				info: macAddress,
			},
		});

		if (!device || !device.id)
			throw new AppError(DEVICE_NOT_FOUND, HttpStatus.NOT_FOUND);

		const records = [];
		const invalidPlayLists = [];

		await Promise.all(body.map(async (log) => {
			const { 
				play_list_name: playListName, 
				temperature, 
				description, 
				log_time: logTime,
				active_time: activeTime,
			} = log;

			const playList = await prisma.apc_play_list.findFirst({
				where: {
					video_url: playListName,
				},
			});

			if (playList && playList.id) {
				records.push({
					device_id: device.id,
					location_id: device.location_id,
					play_list_id: playList.id,
					temperature: parseFloat(temperature),
					description: description || null,
					log_time: new Date(logTime),
					active_time: activeTime || null,
				});
			} else {
				invalidPlayLists.push(playListName);
			}
		}));

		const createdRecords = await prisma.apc_device_logs.createMany({
			data: records,
		});

		return { createdRecords };
	}

	async updateLog() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.apc_device_logs.update({
			where: {
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteLog() {
		const { id } = this.req.params;

		await prisma.apc_device_logs.delete({
			where: {
				id: parseInt(id, 10),
			},
		});

		return null;
	}

	async deleteManyLog() {
		const { ids } = this.req.body;

		await prisma.apc_device_logs.deleteMany({
			where: {
				id: {
					in: ids,
				},
			},
		});

		return null;
	}
}
