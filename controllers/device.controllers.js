import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_DEVICE_SUCCESS,
	DEVICE_CREATED_SUCCESS,
	DEVICE_UPDATED_SUCCESS,
	DEVICE_DELETED_SUCCESS,
} from '../constants';
import { DeviceService } from '../services';
import { successResponse } from '../utils';

export const getAllDevices = asyncHandler(async (req, res) => {
	const deviceService = new DeviceService(req);
	const data = await deviceService.getAllDevices();

	return successResponse(res, HttpStatus.OK, GET_DEVICE_SUCCESS, data);
});

export const getDevice = asyncHandler(async (req, res) => {
	const deviceService = new DeviceService(req);
	const data = await deviceService.getDevice();

	return successResponse(res, HttpStatus.OK, GET_DEVICE_SUCCESS, data);
});

export const getDeviceByMac = asyncHandler(async (req, res) => {
	const deviceService = new DeviceService(req);
	const data = await deviceService.getDeviceByMac();

	return successResponse(res, HttpStatus.OK, GET_DEVICE_SUCCESS, data);
});

export const createDevice = asyncHandler(async (req, res) => {
	const deviceService = new DeviceService(req);
	const data = await deviceService.createDevice();

	return successResponse(res, HttpStatus.OK, DEVICE_CREATED_SUCCESS, data);
});

export const updateDevice = asyncHandler(async (req, res) => {
	const deviceService = new DeviceService(req);
	const data = await deviceService.updateDevice();

	return successResponse(res, HttpStatus.OK, DEVICE_UPDATED_SUCCESS, data);
});

export const deleteDevice = asyncHandler(async (req, res) => {
	const deviceService = new DeviceService(req);
	const data = await deviceService.deleteDevice();

	return successResponse(res, HttpStatus.OK, DEVICE_DELETED_SUCCESS, data);
});

export const deleteManyDevice = asyncHandler(async (req, res) => {
	const deviceService = new DeviceService(req);
	const data = await deviceService.deleteManyDevice();

	return successResponse(res, HttpStatus.OK, DEVICE_DELETED_SUCCESS, data);
});
