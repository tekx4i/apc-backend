import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';
import ffmpeg from 'fluent-ffmpeg';

import { PLAYLIST_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class PlaylistService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllPlaylists() {
		const { query, user } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				is_deleted: false,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'date') {
					return {
						date: {
							gte: search[key],
							lt: new Date(new Date(search[key]).setDate(new Date(search[key]).getDate() + 1))
						}
					};
				}
				if (key === 'number' || key === 'location_id') {
					return { [key]: parseInt(search[key], 10) };	
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

		const totalCount = await prisma.apc_play_list.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			play_list_ads: {
				select: {
					ad: {
						select: {
							id: true,
							name: true,
							description: true,
							video_url: true,
							// count: true,
							duration: true,
						},
					},
				},
			},
			location: true,
		};

		const allRecords = await prisma.apc_play_list.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(PLAYLIST_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getPlaylist() {
		const { id } = this.req.params;
		const record = await prisma.apc_play_list.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			include: {
				play_list_ads: {
					select: {
						ad: {
							select: {
								id: true,
								name: true,
								description: true,
								video_url: true,
								duration: true,
								author: {
									select: {
										id: true,
										name: true,
									},
								},
								media: true,
							},
						},
					},
				},
				location: true,
			},
		});
		if (!record || !record.id)
			throw new AppError(PLAYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async getCurrentPlaylist() {
		const { query } = this.req;
		const { device_id, location_id, mac_address, date } = query;
		
		if(!location_id && !device_id && !mac_address)
			throw new AppError('Parameter location_id, device_id or mac_address is required', HttpStatus.BAD_REQUEST);

		let locationId = location_id;

		if(!location_id && (device_id || mac_address) ){
			const record = await prisma.apc_devices.findFirst({
				where: {
					...(device_id && { id: device_id }),
					...(mac_address && { info: mac_address }),
				},
			});
			if(!record || !record.id)
				throw new AppError(PLAYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);

			await prisma.apc_devices.update({
				where: {
					id: record.id,
				},
				data: {
					start_time: new Date(),
				},
			});
			
			locationId = record.location_id;
		}
		const today = new Date(
			new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }))
		).toISOString().split('T')[0];
		
		const records = await prisma.apc_play_list.findMany({
			where: {
				is_deleted: false,
				location_id: locationId,
				info: {
					contains: `${today}-${locationId}`,
				},
				// date: {
				// 	gte: dateVal,
				// 	lt: dateVal,
				// },
			},
			orderBy: {
				date: 'desc',
			},
		});
		if (!records || !Array.isArray(records) || records.length === 0)
			throw new AppError(PLAYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
		return records;
	}

	async getNextPlaylist() {
		const { query } = this.req;
		const { device_id, location_id, mac_address, date } = query;
		
		if(!location_id && !device_id && !mac_address)
			throw new AppError('Parameter location_id, device_id or mac_address is required', HttpStatus.BAD_REQUEST);

		let locationId = location_id;

		if(!location_id && (device_id || mac_address) ){
			const record = await prisma.apc_devices.findFirst({
				where: {
					...(device_id && { id: device_id }),
					...(mac_address && { info: mac_address }),
				},
			});
			if(!record || !record.id)
				throw new AppError(PLAYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
			locationId = record.location_id;
		}

		const nextDate = new Date(
			new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })).setDate(new Date().getDate() + 1)
		).toISOString().split('T')[0];
		
		const records = await prisma.apc_play_list.findMany({
			where: {
				is_deleted: false,
				location_id: locationId,
				info: {
					contains: `${nextDate}-${locationId}`,
				},
				// date: {
				// 	gte: dateVal,
				// 	lt: dateVal,
				// },
			},
			orderBy: {
				date: 'desc',
			},
		});
		if (!records || !Array.isArray(records) || records.length === 0)
			throw new AppError(PLAYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);
		return records;
	}

	async createPlaylist() {
		const { ads, devices, ...insertInfo } = this.body;

		const record = await prisma.apc_play_list.create({
			data: insertInfo,
		});

		const playlistAdsData = ads.map(value => ({
			ad_id: value,
			playlist_id: record.id,
		}))

		await prisma.apc_play_list_ads.createMany({
			data: playlistAdsData,
		});

		const playlistDevicesData = devices.map(value => ({
			device_id: value,
			playlist_id: record.id,
		}))

		await prisma.apc_play_list_devices.createMany({
			data: playlistDevicesData,
		});

		await this.createPlaylistVideo(record.id);

		return { record };
	}

	async updatePlaylist() {
		const { id } = this.req.params;
		const { ads, devices, ...insertInfo } = this.body;

		const updateRecord = await prisma.apc_play_list.update({
			where: {
				id: parseInt(id, 10),
				is_deleted: false,
			},
			data: insertInfo,
		});

		if (ads){
			await prisma.apc_play_list_ads.deleteMany({
				where: {
					// ad_id: {
					// 	in: ads,
					// },
					playlist_id: updateRecord.id,
				},
			});

			const playlistAdsData = ads.map(value => ({
				ad_id: value,
				playlist_id: updateRecord.id,
			}))
	
			await prisma.apc_play_list_ads.createMany({
				data: playlistAdsData,
			});

			await this.createPlaylistVideo(updateRecord.id);
		}

		if (devices){
			await prisma.apc_play_list_devices.deleteMany({
				where: {
					device_id: {
						in: devices,
					},
					playlist_id: updateRecord.id,
				},
			});

			const playlistDevicesData = devices.map(value => ({
				device_id: value,
				playlist_id: updateRecord.id,
			}))
	
			await prisma.apc_play_list_devices.createMany({
				data: playlistDevicesData,
			});
		}

		return updateRecord;
	}

	async deletePlaylist() {
		const { id } = this.req.params;

		await prisma.apc_play_list.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async deleteManyPlaylist() {
		const { ids } = this.req.body;

		await prisma.apc_play_list.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async createPlaylistVideo(id){
		const record = await prisma.apc_play_list.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			include: {
				play_list_ads: {
					select: { ad: true },
				},
			}
		});

		if (!record || !record.id )
			throw new AppError(PLAYLIST_NOT_FOUND, HttpStatus.NOT_FOUND);

		const fileName = `playlist_${id}.mp4`;

		const outputFile = `temp_uploads/playlists/${fileName}`;

		const generateFilter = (files) => {
			let filterComplex = '';
			let index = 0;
			
			files.forEach((file, i) => {
				filterComplex += `[${i}:v]scale=1280:720,setsar=1[v${index}]; `;
				index++;
			});
		
			let concatInputs = files.map((_, i) => `[v${i}]`).join('');
			filterComplex += `${concatInputs}concat=n=${files.length}:v=1:a=0[outv]`;
		
			return filterComplex;
		};
		
		const command = ffmpeg();
		
		// Dynamically add input files
		record.play_list_ads.forEach(ads => command.input('temp_uploads/ads/'+ads.ad.video_url));
		
		command
			.complexFilter(generateFilter(record.play_list_ads))
			.outputOptions(['-map [outv]', '-c:v libx264', '-r 30', '-preset fast'])
			.save(outputFile)
			.on('progress', (progress) => console.log(`Processing: ${progress.percent}% done`))
			.on('end', () => console.log('Merging completed!'))
			.on('error', (err) => console.error('Error:', err.message));

		await prisma.apc_play_list.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				video_url: fileName,
			},
		});
	}
}
