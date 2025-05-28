import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { BOOKING_NOT_FOUND } from '../constants';
import { AppError } from '../errors';
import { bool } from 'yup';

const prisma = new PrismaClient();

export class BookingService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllBookings() {
		const { query, user } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				...(user.role_id === 1 || user.role_id === 2 ? {} : { user_id: user.id }),
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'ad_id' || key === 'location_id' || 
					key === 'payment_id' || key === 'status' || key === 'user_id') {
					return { [key]: search[key] };
				}
				if (key === 'start_date') {
					return {
						start_date: {
							gte: search[key],
						}
					};
				}
				if (key === 'end_date') {
					return {
						end_date: {
							lte: search[key],
						}
					};
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

		const totalCount = await prisma.apc_ads_booking.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			ad: {
				select: {
					id: true,
					name: true,
					description: true,
					video_url: true,
					duration: true,
					status: true,
				}
			},
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			},
			payment: true,
			// details: true,
		}

		const allRecords = await prisma.apc_ads_booking.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getAllAvailableBookings() {
		const { query } = this.req;

		const { location, duration, start_date: startDate, end_date: endDate } = query;

		const info = await this.checkAvailability(startDate, endDate, location, 0, parseInt(duration, 10));

		delete info.totalDuration;

		return { ...info };
	}

	async getBooking() {
		const { id } = this.req.params;
		const { user } = this.req;
		const record = await prisma.apc_ads_booking.findUnique({
			where: {
				id: parseInt(id, 10),
				...(user.role_id === 1 || user.role_id === 2 ? {} : { user_id: user.id }),
			},
			include: {
				ad: {
					select: {
						id: true,
						name: true,
						description: true,
						video_url: true,
						duration: true,
						status: true,
					}
				},
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					}
				},
				payment: true,
				details: true,
			}
		});
		if (!record || !record.id)
			throw new AppError(BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createBooking() {
		const { user } = this.req;
		const { start_date:startDate, end_date:endDate, location_id:locationId, ad_id:adID } = this.body;

		const info = await this.checkAvailability(startDate, endDate, locationId, adID);

		const adBooking = await prisma.apc_ads_booking.create({
			data: {
				ad_id: adID,
				location_id: locationId,
				start_date: startDate,
				end_date: endDate,
				total_duration: info.totalDuration,
				user_id: user.id,
				status: user?.skip_payment ? 'CONFIRMED' : 'PENDING',
			}
		});

		const updatedData = info.adBookingDetails.map(item => ({
			...item,
			booking_id: adBooking.id
		}));

		await prisma.apc_ads_booking_details.createMany({
			data: updatedData
		})

		return { adBooking, totalDuration: info.totalDuration };
	}

	async checkAvailability(startDate, endDate, locationId, adId=0, duration=0){
		let adDuration = duration;
		const maxTime = 540;
		
		if(adId > 0){
			const ad = await prisma.apc_ads.findUnique({ where: { id: adId } });
			adDuration = ad.duration;
		}
		
		let totalDuration = 0;
		let adBookingDetails = [];
		
		// Create date objects that maintain the original date regardless of timezone
		const start = new Date(startDate);
		const end = new Date(endDate);
		
		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			// Format the date in YYYY-MM-DD format without timezone conversion
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			const formattedDate = `${year}-${month}-${day}`;
			
			// Check availability
			const existingBookings = await prisma.apc_ads_booking_details.findMany({
				where: { 
					booking: { location_id: locationId }, 
					date: new Date(formattedDate) 
				},
				select: { duration: true },
			});
			
			const bookedTime = existingBookings.reduce((sum, b) => sum + b.duration, 0);
			const availableTime = maxTime - bookedTime;
			
			if (availableTime < adDuration) {
				throw new AppError(`No available slots on ${formattedDate}`, HttpStatus.NOT_FOUND);
			}
			
			totalDuration += adDuration;
			adBookingDetails.push({
				date: new Date(formattedDate),
				duration: adDuration,
				...(adId === 0 ? { availableTime: availableTime } : {}) 
			});
		}
		
		return {
			totalDuration,
			adBookingDetails,
		}
	}

	async updateBooking() {
		const { id } = this.req.params;
		const { body, user } = this.req;

		const updateRecord = await prisma.apc_ads_booking.update({
			where: {
				id: parseInt(id, 10),
				...(user.role_id === 1 || user.role_id === 2 ? {} : { user_id: user.id }),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteBooking() {
		const { id } = this.req.params;
		const { user } = this.req;

		await prisma.apc_ads_booking.update({
			where: {
				id: parseInt(id, 10),
				...(user.role_id === 1 || user.role_id === 2 ? {} : { user_id: user.id }),
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async deleteManyBooking() {
		const { ids } = this.req.body;

		await prisma.apc_ads_booking.updateMany({
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
