import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { DEVICE_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class DeviceService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllDevices() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				is_deleted: false,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if(key === 'location_id'){
					return { [key]: search[key] };
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

		const totalCount = await prisma.apc_devices.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			location: {
				select: {
					name: true,
					lat_long: true,
				}
			}
		};

		const allRecords = await prisma.apc_devices.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(DEVICE_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getDevice() {
		const { id } = this.req.params;
	
		const record = await prisma.apc_devices.findUnique({
			where: {
				id: parseInt(id, 10),
				is_deleted: false
			},
			include: {
				location: {
					select: {
						name: true,
						lat_long: true,
					}
				}
			}
		});
	
		if (!record) throw new AppError(DEVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
	
		return record;
	}

	async getDeviceByMac() {
		const { mac } = this.req.params;
	
		const record = await prisma.apc_devices.findFirst({
			where: {
				info: mac,
				is_deleted: false
			},
			include: {
				location: {
					select: {
						name: true,
						lat_long: true,
					}
				}
			}
		});
	
		if (!record) throw new AppError(DEVICE_NOT_FOUND, HttpStatus.NOT_FOUND);
	
		return record;
	}

	async createDevice() {
		const { body } = this.req;

		const record = await prisma.apc_devices.findFirst({
			where: {
				info: body.info,
				is_deleted: false
			}
		});
		let newRecord;
		if(record){
			delete body.info;

			newRecord = await prisma.apc_devices.update({
				where: {
					id: record.id,
				},
				data: {
					...body,
					status: 'Online',
				},
			});

		} else {
			newRecord = await prisma.apc_devices.create({
				data: {
					...body,
					status: 'Online',
				},
			});
		}

		return newRecord;
	}

	async updateDevice() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.apc_devices.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteDevice() {
		const { id } = this.req.params;

		await prisma.apc_devices.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async deleteManyDevice() {
		const { ids } = this.req.body;

		await prisma.apc_devices.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}
}
