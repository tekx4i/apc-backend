import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_BOOKING_SUCCESS,
	BOOKING_CREATED_SUCCESS,
	BOOKING_UPDATED_SUCCESS,
	BOOKING_DELETED_SUCCESS,
} from '../constants';
import { BookingService } from '../services';
import { successResponse } from '../utils';

export const getAllBookings = asyncHandler(async (req, res) => {
	const bookingService = new BookingService(req);
	const data = await bookingService.getAllBookings();

	return successResponse(res, HttpStatus.OK, GET_BOOKING_SUCCESS, data);
});

export const getAllAvailableBookings = asyncHandler(async (req, res) => {
	const bookingService = new BookingService(req);
	const data = await bookingService.getAllAvailableBookings();

	return successResponse(res, HttpStatus.OK, GET_BOOKING_SUCCESS, data);
});

export const getBooking = asyncHandler(async (req, res) => {
	const bookingService = new BookingService(req);
	const data = await bookingService.getBooking();

	return successResponse(res, HttpStatus.OK, GET_BOOKING_SUCCESS, data);
});

export const createBooking = asyncHandler(async (req, res) => {
	const bookingService = new BookingService(req);
	const data = await bookingService.createBooking();

	return successResponse(res, HttpStatus.OK, BOOKING_CREATED_SUCCESS, data);
});

export const updateBooking = asyncHandler(async (req, res) => {
	const bookingService = new BookingService(req);
	const data = await bookingService.updateBooking();

	return successResponse(res, HttpStatus.OK, BOOKING_UPDATED_SUCCESS, data);
});

export const deleteBooking = asyncHandler(async (req, res) => {
	const bookingService = new BookingService(req);
	const data = await bookingService.deleteBooking();

	return successResponse(res, HttpStatus.OK, BOOKING_DELETED_SUCCESS, data);
});

export const deleteManyBooking = asyncHandler(async (req, res) => {
	const bookingService = new BookingService(req);
	const data = await bookingService.deleteManyBooking();

	return successResponse(res, HttpStatus.OK, BOOKING_DELETED_SUCCESS, data);
});
