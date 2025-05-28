import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_AD_SUCCESS,
	AD_CREATED_SUCCESS,
	AD_UPDATED_SUCCESS,
	AD_DELETED_SUCCESS,
} from '../constants';
import { AdService } from '../services';
import { successResponse } from '../utils';

export const getAllAds = asyncHandler(async (req, res) => {
	const adService = new AdService(req);
	const data = await adService.getAllAds();

	return successResponse(res, HttpStatus.OK, GET_AD_SUCCESS, data);
});

export const getAd = asyncHandler(async (req, res) => {
	const adService = new AdService(req);
	const data = await adService.getAd();

	return successResponse(res, HttpStatus.OK, GET_AD_SUCCESS, data);
});

export const createAd = asyncHandler(async (req, res) => {
	const adService = new AdService(req);
	const data = await adService.createAd();

	return successResponse(res, HttpStatus.OK, AD_CREATED_SUCCESS, data);
});

export const updateAd = asyncHandler(async (req, res) => {
	const adService = new AdService(req);
	const data = await adService.updateAd();

	return successResponse(res, HttpStatus.OK, AD_UPDATED_SUCCESS, data);
});

export const deleteAd = asyncHandler(async (req, res) => {
	const adService = new AdService(req);
	const data = await adService.deleteAd();

	return successResponse(res, HttpStatus.OK, AD_DELETED_SUCCESS, data);
});

export const deleteManyAd = asyncHandler(async (req, res) => {
	const adService = new AdService(req);
	const data = await adService.deleteManyAd();

	return successResponse(res, HttpStatus.OK, AD_DELETED_SUCCESS, data);
});
