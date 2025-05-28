import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_SPICE_SUCCESS,
	SPICE_CREATED_SUCCESS,
	SPICE_UPDATED_SUCCESS,
	SPICE_DELETED_SUCCESS,
} from '../constants';
import { SpiceService } from '../services';
import { successResponse } from '../utils';

export const getAllSpices = asyncHandler(async (req, res) => {
	const spiceService = new SpiceService(req);
	const data = await spiceService.getAllSpices();

	return successResponse(res, HttpStatus.OK, GET_SPICE_SUCCESS, data);
});

export const getSpice = asyncHandler(async (req, res) => {
	const spiceService = new SpiceService(req);
	const data = await spiceService.getSpice();

	return successResponse(res, HttpStatus.OK, GET_SPICE_SUCCESS, data);
});

export const createSpice = asyncHandler(async (req, res) => {
	const spiceService = new SpiceService(req);
	const data = await spiceService.createSpice();

	return successResponse(res, HttpStatus.OK, SPICE_CREATED_SUCCESS, data);
});

export const updateSpice = asyncHandler(async (req, res) => {
	const spiceService = new SpiceService(req);
	const data = await spiceService.updateSpice();

	return successResponse(res, HttpStatus.OK, SPICE_UPDATED_SUCCESS, data);
});

export const deleteSpice = asyncHandler(async (req, res) => {
	const spiceService = new SpiceService(req);
	const data = await spiceService.deleteSpice();

	return successResponse(res, HttpStatus.OK, SPICE_DELETED_SUCCESS, data);
});

export const deleteManySpice = asyncHandler(async (req, res) => {
	const spiceService = new SpiceService(req);
	const data = await spiceService.deleteManySpice();

	return successResponse(res, HttpStatus.OK, SPICE_DELETED_SUCCESS, data);
});
