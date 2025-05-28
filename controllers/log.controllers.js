import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_LOG_SUCCESS,
	LOG_CREATED_SUCCESS,
	LOG_UPDATED_SUCCESS,
	LOG_DELETED_SUCCESS,
} from '../constants';
import { LogService } from '../services';
import { successResponse } from '../utils';

export const getAllLogs = asyncHandler(async (req, res) => {
	const logService = new LogService(req);
	const data = await logService.getAllLogs();

	return successResponse(res, HttpStatus.OK, GET_LOG_SUCCESS, data);
});

export const getLog = asyncHandler(async (req, res) => {
	const logService = new LogService(req);
	const data = await logService.getLog();

	return successResponse(res, HttpStatus.OK, GET_LOG_SUCCESS, data);
});

export const createLog = asyncHandler(async (req, res) => {
	const logService = new LogService(req);
	const data = await logService.createLog();

	return successResponse(res, HttpStatus.OK, LOG_CREATED_SUCCESS, data);
});

export const createMultipleLog = asyncHandler(async (req, res) => {
	const logService = new LogService(req);
	const data = await logService.createMultipleLog();

	return successResponse(res, HttpStatus.OK, LOG_CREATED_SUCCESS, data);
});

export const updateLog = asyncHandler(async (req, res) => {
	const logService = new LogService(req);
	const data = await logService.updateLog();

	return successResponse(res, HttpStatus.OK, LOG_UPDATED_SUCCESS, data);
});

export const deleteLog = asyncHandler(async (req, res) => {
	const logService = new LogService(req);
	const data = await logService.deleteLog();

	return successResponse(res, HttpStatus.OK, LOG_DELETED_SUCCESS, data);
});

export const deleteManyLog = asyncHandler(async (req, res) => {
	const logService = new LogService(req);
	const data = await logService.deleteManyLog();

	return successResponse(res, HttpStatus.OK, LOG_DELETED_SUCCESS, data);
});
