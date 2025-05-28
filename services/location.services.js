import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { LOCATION_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class LocationService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllLocations() {
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
			options.where.AND = Object.keys(search).map(key => ({
				[key]: { contains: search[key] },
			}));
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.apc_locations.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.apc_locations.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(LOCATION_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getLocation() {
		const { id } = this.req.params;
		const record = await prisma.apc_locations.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(LOCATION_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createLocation() {
		const { body } = this.req;

		const record = await prisma.apc_locations.create({
			data: body,
		});

		return { record };
	}

	async updateLocation() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.apc_locations.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteLocation() {
		const { id } = this.req.params;

		await prisma.apc_locations.update({
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

	async deleteManyLocation() {
		const { ids } = this.req.body;

		await prisma.apc_locations.updateMany({
			where: {
				id: {
					in: ids,
				},
				is_deleted: false,
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}
}
