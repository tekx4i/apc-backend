import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';

import { USER_NOT_FOUND, ACCOUNT_STATUS } from '../constants';
import { AppError } from '../errors';
import { generateRandomString } from '../utils';

const prisma = new PrismaClient();

export class UserService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllUsers() {
		const { query, user } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				is_deleted: 0,
				...( user.id ? { id: { notIn: [user.id] } } : {} ),
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

		const totalCount = await prisma.apc_users.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.select = {
			id: true,
			name: true,
			email: true,
			status: true,
			address: true,
			city: true,
			country: true,
			image: true,
			state: true,
			number: true,
			skip_payment: true,
			last_login: true,
			created_at: true,
			updated_at: true,
			apc_roles: true,
		};

		const allRecords = await prisma.apc_users.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getUser() {
		const { id } = this.req.params;
		const record = await prisma.apc_users.findUnique({
			where: {
				is_deleted: 0,
				id: parseInt(id, 10),
			},
			select: {
				id: true,
				name: true,
				email: true,
				status: true,
				address: true,
				city: true,
				country: true,
				image: true,
				state: true,
				number: true,
				skip_payment: true,
				last_login: true,
				created_at: true,
				updated_at: true,
				apc_roles: true,
			}
		});
		return this.publicProfile(record);
	}

	async getDashboardStats() {
		// const { user } = this.req;
		const statusWiseDevices = await prisma.apc_devices.groupBy({
			by: ['status'],
			_count: {
			  	_all: true,
			},
			where: {
				is_deleted: false,
			},
		});
		  
		const totalDevices = await prisma.apc_devices.count({
			where: {
				is_deleted: false,
			},
		});
		  
		return { statusWiseDevices, totalDevices };
	}

	async createUser() {
		const { body, user } = this.req;
		let { password } = body;

		const birthDate = body.birth_date;

		if (!password) {
			password = generateRandomString(6, 20);
		}

		if(body?.skip_payment && user.role_id !== 1) {
			delete body.skip_payment;
		}

		body.password = await bcrypt.hash(password, 12);
		if (birthDate) {
			body.birth_date = new Date(`${birthDate}T00:00:00.000Z`);
		}
		body.status = ACCOUNT_STATUS.ACTIVE;

		body.created_by = user.id;

		const newUser = await prisma.apc_users.create({ data: body });

		return this.publicProfile(newUser);
	}

	async updateUser() {
		const { id } = this.req.params;
		const { body, file, user } = this.req;

		if (file?.filename) {
			body.image = file.filename;
		}
		
		if(body.password) {
			body.password = await bcrypt.hash(body.password, 12);
		}

		if(body?.skip_payment && user.role_id !== 1) {
			delete body.skip_payment;
		}

		const updateRecord = await prisma.apc_users.update({
			where: {
				is_deleted: 0,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return this.publicProfile(updateRecord);
	}

	async updateManyUser() {
		const { ids, status } = this.req.body;

		const updateRecord = await prisma.apc_users.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				status,
			},
		});

		return updateRecord;
	}

	async deleteUser() {
		const { user } = this.req;
		const { id } = this.req.params;

		if (user.id === id) {
			throw new AppError(
				'You are not allowed to delete yourself',
				HttpStatus.NOT_FOUND,
			);
		}

		await prisma.apc_users.update({
			where: {
				is_deleted: 0,
				id: parseInt(id, 10),
			},
			data: {
				is_deleted: 1,
			},
		});

		return null;
	}

	async deleteManyUser() {
		const { user } = this.req;
		const { ids } = this.req.body;

		if (ids.includes(user.id)) {
			throw new AppError(
				'You are not allowed to delete yourself',
				HttpStatus.NOT_FOUND,
			);
		}

		await prisma.apc_users.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				is_deleted: 1,
			},
		});

		return null;
	}

	/* eslint-disable-next-line class-methods-use-this */
	publicProfile(user) {
		const record = { ...user };
		if (!record || !record.id)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		if (record.password) delete record.password;
		if (record.remember_token) delete record.remember_token;

		return record;
	}
}
