import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_LOCATION_SUCCESS,
	LOCATION_CREATED_SUCCESS,
	LOCATION_UPDATED_SUCCESS,
	LOCATION_DELETED_SUCCESS,
} from '../constants';
import { LocationService } from '../services';
import { successResponse } from '../utils';

export const getAllLocations = asyncHandler(async (req, res) => {
	const locationService = new LocationService(req);
	const data = await locationService.getAllLocations();

	return successResponse(res, HttpStatus.OK, GET_LOCATION_SUCCESS, data);
});

export const getLocation = asyncHandler(async (req, res) => {
	const locationService = new LocationService(req);
	const data = await locationService.getLocation();

	return successResponse(res, HttpStatus.OK, GET_LOCATION_SUCCESS, data);
});

export const createLocation = asyncHandler(async (req, res) => {
	const locationService = new LocationService(req);
	const data = await locationService.createLocation();

	return successResponse(res, HttpStatus.OK, LOCATION_CREATED_SUCCESS, data);
});

export const updateLocation = asyncHandler(async (req, res) => {
	const locationService = new LocationService(req);
	const data = await locationService.updateLocation();

	return successResponse(res, HttpStatus.OK, LOCATION_UPDATED_SUCCESS, data);
});

export const deleteLocation = asyncHandler(async (req, res) => {
	const locationService = new LocationService(req);
	const data = await locationService.deleteLocation();

	return successResponse(res, HttpStatus.OK, LOCATION_DELETED_SUCCESS, data);
});

export const deleteManyLocation = asyncHandler(async (req, res) => {
	const locationService = new LocationService(req);
	const data = await locationService.deleteManyLocation();

	return successResponse(res, HttpStatus.OK, LOCATION_DELETED_SUCCESS, data);
});
