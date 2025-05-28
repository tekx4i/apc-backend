import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';
import stripePackage from 'stripe';

import { STRIPE_SECRET_KEY } from '../config';
import { 
	PAYMENT_NOT_FOUND, 
	PAYMENT_STATUS,
	PAYMENT_FAILED 
} from '../constants';
import { AppError } from '../errors';

const stripe = stripePackage(STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

export class PaymentService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllPayments() {
		const { query, user } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				is_deleted: false,
				...(user.role_id === 1 || user.role_id === 2 ? {} : { user_id: user.id }),
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'user_id' || key === 'package_id' || key === 'method') {
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

		const totalCount = await prisma.apc_payments.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.apc_payments.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(PAYMENT_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getPayment() {
		const { id } = this.req.params;
		const { user } = this.req;
		const record = await prisma.apc_payments.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
				...(user.role_id === 1 || user.role_id === 2 ? {} : { user_id: user.id }),
			},
		});
		if (!record || !record.id)
			throw new AppError(PAYMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createPayment() {
		const { body, user } = this.req;

		const { package_id: packageId, booking_ids: bookingIds } = body;

		// Get total duration from bookings
		const bookings = await prisma.apc_ads_booking.findMany({
			where: {
				id: {
					in: bookingIds
				}
			},
			select: {
				total_duration: true
			}
		});

		const totalDuration = bookings.reduce((sum, booking) => sum + booking.total_duration, 0);

		const packageDetails = await prisma.apc_packages.findUnique({
			where: {
				id: packageId,
				is_deleted: false
			}
		});

		const slots = Math.ceil(totalDuration / packageDetails.duration);
		const totalAmount = (slots * packageDetails.price).toFixed(2);

		let ephemeralKey;
		let paymentIntent;
		let customerId;

		const userStripeId = await prisma.apc_user_meta.findFirst({
			where: {
				user_id: user.id,
				key: 'stripe_customer_id',
			},
		});
		if (userStripeId && userStripeId?.value) {
			customerId = userStripeId.value;
		} else {
			const customer = await stripe.customers.create({
				name: user.name,
				email: user.email,
			});
			customerId = customer.id;

			await prisma.apc_user_meta.create({
				data: {
					user_id: user.id,
					key: 'stripe_customer_id',
					value: customerId,
				},
			});
		}

		ephemeralKey = await stripe.ephemeralKeys.create(
			{ customer: customerId },
			{ apiVersion: '2024-04-10' },
		);

		paymentIntent = await stripe.paymentIntents.create({
			amount: totalAmount * 100,
			currency: 'usd',
			customer: customerId,
			automatic_payment_methods: {
				enabled: true,
			},
			metadata: {
				ids: JSON.stringify(bookingIds),
				userId: user.id,
			},
		});

		if (!paymentIntent?.id) throw new AppError(PAYMENT_FAILED, HttpStatus.NOT_FOUND);

		const payment = await prisma.apc_payments.create({
			data: {
				package_id: packageId,
				user_id: user.id,
				amount: parseFloat(totalAmount),
				method: 'stripe',
				payment_info: paymentIntent.id,
				status: PAYMENT_STATUS.PENDING,
			},
		});

		await prisma.apc_ads_booking.updateMany({
			where: {
				id: {
					in: bookingIds
				}
			},
			data: {
				payment_id: payment.id,
			},
		});

		return {
			payment,
			paymentIntent: paymentIntent?.client_secret,
			ephemeralKey: ephemeralKey?.secret,
			customer: customerId,
			paymentIntentId: paymentIntent?.id,
		};
	}

	async updatePayment() {
		const { body, user } = this.req;
		const { paymentIntentId } = body;

		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status !== 'succeeded')
			throw new AppError(
				`Payment status: ${paymentIntent?.status}`,
				HttpStatus.NOT_FOUND,
			);

		const payment = await prisma.apc_payments.findFirst({
			where: {
				user_id: user.id,
				payment_info: paymentIntentId,
			},
		});
		if (!payment) throw new AppError(PAYMENT_NOT_FOUND, HttpStatus.NOT_FOUND);

		const updatedPayment = await prisma.apc_payments.update({
			where: {
				id: payment.id,
			},
			data: {
				status: PAYMENT_STATUS.PAID,
			},
		});

		await prisma.apc_ads_booking.updateMany({
			where: {
				payment_id: payment.id,
			},
			data: {
				status: 'CONFIRMED',
			},
		});

		return updatedPayment;
	}

	async deletePayment() {
		const { id } = this.req.params;
		const { user } = this.req;

		await prisma.apc_payments.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
				...(user.role_id === 1 || user.role_id === 2 ? {} : { user_id: user.id }),
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async deleteManyPayment() {
		const { ids } = this.req.body;
		const { user } = this.req;

		await prisma.apc_payments.updateMany({
			where: {
				id: {
					in: ids,
				},
				is_deleted: false,
				...(user.role_id === 1 || user.role_id === 2 ? {} : { user_id: user.id }),
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}
}
