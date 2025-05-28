import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_PACKAGE_SUCCESS,
	PACKAGE_CREATED_SUCCESS,
	PACKAGE_UPDATED_SUCCESS,
	PACKAGE_DELETED_SUCCESS,
} from '../constants';
import { PackageService } from '../services';
import { successResponse } from '../utils';

export const getAllPackages = asyncHandler(async (req, res) => {
	const packageService = new PackageService(req);
	const data = await packageService.getAllPackages();

	return successResponse(res, HttpStatus.OK, GET_PACKAGE_SUCCESS, data);
});

export const getPackage = asyncHandler(async (req, res) => {
	const packageService = new PackageService(req);
	const data = await packageService.getPackage();

	return successResponse(res, HttpStatus.OK, GET_PACKAGE_SUCCESS, data);
});

export const createPackage = asyncHandler(async (req, res) => {
	const packageService = new PackageService(req);
	const data = await packageService.createPackage();

	return successResponse(res, HttpStatus.OK, PACKAGE_CREATED_SUCCESS, data);
});

export const updatePackage = asyncHandler(async (req, res) => {
	const packageService = new PackageService(req);
	const data = await packageService.updatePackage();

	return successResponse(res, HttpStatus.OK, PACKAGE_UPDATED_SUCCESS, data);
});

export const deletePackage = asyncHandler(async (req, res) => {
	const packageService = new PackageService(req);
	const data = await packageService.deletePackage();

	return successResponse(res, HttpStatus.OK, PACKAGE_DELETED_SUCCESS, data);
});

export const deleteManyPackage = asyncHandler(async (req, res) => {
	const packageService = new PackageService(req);
	const data = await packageService.deleteManyPackage();

	return successResponse(res, HttpStatus.OK, PACKAGE_DELETED_SUCCESS, data);
});
