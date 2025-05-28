import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_PLAYLIST_SUCCESS,
	PLAYLIST_CREATED_SUCCESS,
	PLAYLIST_UPDATED_SUCCESS,
	PLAYLIST_DELETED_SUCCESS,
} from '../constants';
import { PlaylistService } from '../services';
import { successResponse } from '../utils';

export const getAllPlaylists = asyncHandler(async (req, res) => {
	const playlistService = new PlaylistService(req);
	const data = await playlistService.getAllPlaylists();

	return successResponse(res, HttpStatus.OK, GET_PLAYLIST_SUCCESS, data);
});

export const getCurrentPlaylist = asyncHandler(async (req, res) => {
	const playlistService = new PlaylistService(req);
	const data = await playlistService.getCurrentPlaylist();

	return successResponse(res, HttpStatus.OK, GET_PLAYLIST_SUCCESS, data);
});

export const getNextPlaylist = asyncHandler(async (req, res) => {
	const playlistService = new PlaylistService(req);
	const data = await playlistService.getNextPlaylist();

	return successResponse(res, HttpStatus.OK, GET_PLAYLIST_SUCCESS, data);
});

export const getPlaylist = asyncHandler(async (req, res) => {
	const playlistService = new PlaylistService(req);
	const data = await playlistService.getPlaylist();

	return successResponse(res, HttpStatus.OK, GET_PLAYLIST_SUCCESS, data);
});

export const createPlaylist = asyncHandler(async (req, res) => {
	const playlistService = new PlaylistService(req);
	const data = await playlistService.createPlaylist();

	return successResponse(res, HttpStatus.OK, PLAYLIST_CREATED_SUCCESS, data);
});

export const updatePlaylist = asyncHandler(async (req, res) => {
	const playlistService = new PlaylistService(req);
	const data = await playlistService.updatePlaylist();

	return successResponse(res, HttpStatus.OK, PLAYLIST_UPDATED_SUCCESS, data);
});

export const deletePlaylist = asyncHandler(async (req, res) => {
	const playlistService = new PlaylistService(req);
	const data = await playlistService.deletePlaylist();

	return successResponse(res, HttpStatus.OK, PLAYLIST_DELETED_SUCCESS, data);
});

export const deleteManyPlaylist = asyncHandler(async (req, res) => {
	const playlistService = new PlaylistService(req);
	const data = await playlistService.deleteManyPlaylist();

	return successResponse(res, HttpStatus.OK, PLAYLIST_DELETED_SUCCESS, data);
});
