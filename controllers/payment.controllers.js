import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_PAYMENT_SUCCESS,
	PAYMENT_CREATED_SUCCESS,
	PAYMENT_UPDATED_SUCCESS,
	PAYMENT_DELETED_SUCCESS,
} from '../constants';
import { PaymentService } from '../services';
import { successResponse } from '../utils';

export const getAllPayments = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.getAllPayments();

	return successResponse(res, HttpStatus.OK, GET_PAYMENT_SUCCESS, data);
});

export const getPayment = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.getPayment();

	return successResponse(res, HttpStatus.OK, GET_PAYMENT_SUCCESS, data);
});

export const createPayment = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.createPayment();

	return successResponse(res, HttpStatus.OK, PAYMENT_CREATED_SUCCESS, data);
});

export const updatePayment = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.updatePayment();

	return successResponse(res, HttpStatus.OK, PAYMENT_UPDATED_SUCCESS, data);
});

export const deletePayment = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.deletePayment();

	return successResponse(res, HttpStatus.OK, PAYMENT_DELETED_SUCCESS, data);
});

export const deleteManyPayment = asyncHandler(async (req, res) => {
	const paymentService = new PaymentService(req);
	const data = await paymentService.deleteManyPayment();

	return successResponse(res, HttpStatus.OK, PAYMENT_DELETED_SUCCESS, data);
});
