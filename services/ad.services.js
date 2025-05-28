import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';
import ffmpeg from 'fluent-ffmpeg';

import { AD_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class AdService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllAds() {
		const { query, user } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				is_deleted: false,
				...(user.role_id === 1 || user.role_id === 2 ? {} : { author_id: user.id }),
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => ({
				[key]: { contains: search[key] },
			}));
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.apc_ads.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			media: {
				select: {
					name: true,
					path: true,
					type: true,
					duration: true,
				}
			},
			author: {
				select: {
					name: true,
					image: true,
				}
			},
			apc_ads_booking: {
				where: {
					status: 'CONFIRMED'
				},
				select: {
					id: true,
					status: true,
				}
			}
		};

		const allRecords = await prisma.apc_ads.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(AD_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getAd() {
		const { id } = this.req.params;
		const { user } = this.req;
		const record = await prisma.apc_ads.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
				...(user.role_id === 1 || user.role_id === 2 ? {} : { author_id: user.id }),
			},
			include: {
				media: true,
			}
		});
		if (!record || !record.id)
			throw new AppError(AD_NOT_FOUND, HttpStatus.NOT_FOUND);

		// this.createVideo(id);
		return record;
	}

	async createAd() {
		const { user, body, files } = this.req;

		if (!files || !Array.isArray(files) || files.length === 0)
			throw new AppError('Media Files Missing', HttpStatus.NOT_FOUND);

		const mediaInfo = await this.validateUploadedMedia();

		const ad = await prisma.apc_ads.create({
			data: {
				author_id: user.id,
				...body
			},
		});

		const updatedData = mediaInfo.map(item => ({ ...item, ad_id: ad.id }));

		await prisma.apc_ads_media.createMany({
			data: updatedData,
		});

		this.createVideo(ad.id);

		return { ad };
	}

	async validateUploadedMedia(){
		const { body, files } = this.req;

		let totalVideoDuration = 0;
		let imageCount = 0;

		// Extract media info and calculate durations
		const mediaInfo = files.map(value => {
			const isImage = value.mimetype.startsWith('image/');
			const isVideo = value.mimetype.startsWith('video/');
			let mediaDuration = 0;

			if (isImage) {
				imageCount++;
			}

			if (isVideo) {
				if (!value.duration)
					throw new AppError(`Missing duration for video: ${value.originalname}`, HttpStatus.NOT_ACCEPTABLE);

				totalVideoDuration += value.duration;
				mediaDuration = value.duration;
			}

			return {
				name: value.originalname,
				path: `${value.filename}`,
				type: value.mimetype,
				duration: mediaDuration // Default duration for videos, updated later for images
			};
		});

		let totalAvailableDuration = body.duration - totalVideoDuration;

		if (totalAvailableDuration < 0)
			throw new AppError(`Total video duration (${totalVideoDuration}s) exceeds allowed time (${body.duration}s).`, HttpStatus.NOT_ACCEPTABLE);

		if (imageCount > 0) {
			let imageDuration = totalAvailableDuration / imageCount;

			if (imageDuration < 5)
				throw new AppError(`Each image should have at least 5s, but only ${imageDuration.toFixed(2)}s is available.`, HttpStatus.NOT_ACCEPTABLE);

			mediaInfo.forEach(media => {
				if (media.type.startsWith('image/')) {
					media.duration = imageDuration;
				}
			});
		}

		// Validate total duration against body.duration
		let totalDuration = mediaInfo.reduce((sum, media) => sum + media.duration, 0);
		if (totalDuration > body.duration)
			throw new AppError(`Total media duration (${totalDuration}s) exceeds allowed time (${body.duration}s).`, HttpStatus.NOT_ACCEPTABLE);

		return mediaInfo;
	}

	async updateAd() {
		const { id } = this.req.params;
		const { body, files, user } = this.req;
		const { mediaIds, ...insertInfo } = body;

		const ad = await prisma.apc_ads.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: insertInfo,
		});

		const deleteOption = {
			where: {
				ad_id: ad.id,
			},
		};
		if (mediaIds) {
			deleteOption.where.id = {
				notIn: mediaIds.map(value => parseInt(value, 10)),
			};
		}
		await prisma.apc_ads_media.deleteMany(deleteOption);

		if (files) {
			const mediaInfo = files.map( value => {	
				return {
					user_id: user.id,
					name: value.originalname,
					path: `${value.filename}`,
					type: value.mimetype,
					ad_id: ad.id,
				}
			});
			
			await prisma.apc_ads_media.createMany({
				data: mediaInfo,
			});
		}

		this.createVideo(ad.id);

		return ad;
	}

	async deleteAd() {
		const { id } = this.req.params;
		const { user } = this.req;

		await prisma.apc_ads.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
				...(user.role_id === 1 || user.role_id === 2 ? {} : { author_id: user.id }),
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async deleteManyAd() {
		const { ids } = this.req.body;	
		const { user } = this.req;

		await prisma.apc_ads.updateMany({
			where: {
				id: {
					in: ids,
				},
				...(user.role_id === 1 || user.role_id === 2 ? {} : { author_id: user.id }),
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async createNonFilteredVideo(id) {
		const record = await prisma.apc_ads.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			include: {
				media: true,
			}
		});
	
		if (!record || !record.id)
			throw new AppError(AD_NOT_FOUND, HttpStatus.NOT_FOUND);
	
		if (record.media.length <= 0)
			throw new AppError('Ad media not Found', HttpStatus.NOT_FOUND);
	
		const fileName = `ad_${id}.mp4`;
		const outputFile = `temp_uploads/ads/${fileName}`;
	
		const command = ffmpeg();
	
		// Add input files
		record.media.forEach(file => command.input(`temp_uploads/${file.path}`));
	
		command
			.outputOptions(['-c:v libx264', '-r 30', '-preset fast'])
			.save(outputFile)
			.on('progress', (progress) => console.log(`Processing: ${progress.percent}% done`))
			.on('end', () => console.log('Merging completed!'))
			.on('error', (err) => console.error('Error:', err.message));
	
		await prisma.apc_ads.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				video_url: fileName,
			},
		});
	}	

	async createVideo(id){
		const record = await prisma.apc_ads.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			include: {
				media: true,
			}
		});
		if (!record || !record.id )
			throw new AppError(AD_NOT_FOUND, HttpStatus.NOT_FOUND);
		
		if(record.media.length <= 0)
			throw new AppError('Ad media not Found', HttpStatus.NOT_FOUND);

		const fileName = `ad_${id}.mp4`;

		const outputFile = `temp_uploads/ads/${fileName}`;

		const generateFilter = (files) => {
			let filterComplex = '';
			let index = 0;
			
			files.forEach((file, i) => {
				let type = file.type.split('/');
				let durationFrames = file.duration * 30;
		
				if (type[0] === 'image') {
					filterComplex += `
						[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,
						pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,
						loop=${durationFrames}:1:0,
						format=yuv420p,
						fade=t=in:st=0:d=1,
						trim=duration=${file.duration}
						[v${index}]; `;
				} else if(type[0] === 'video') {
					filterComplex += `[${i}:v]scale=1280:720,setsar=1[v${index}]; `;
				}
				index++;
			});
		
			let concatInputs = files.map((_, i) => `[v${i}]`).join('');
			filterComplex += `${concatInputs}concat=n=${files.length}:v=1:a=0[outv]`;
		
			return filterComplex;
		};
		
		const runFfmpeg = () => {
			return new Promise((resolve, reject) => {
				const command = ffmpeg();

				// Add input files
				record.media.forEach((file) => {
					command.input('temp_uploads/' + file.path);
				});

				command
					.complexFilter(generateFilter(record.media))
					.outputOptions(['-map [outv]', '-c:v libx264', '-r 30', '-preset fast'])
					.save(outputFile)
					.on('progress', (progress) => {
						console.log(`Processing: ${progress.percent}% done`);
					})
					.on('end', () => {
						console.log('Merging completed!');
						resolve();
					})
					.on('error', (err) => {
						console.error('FFmpeg Error:', err.message);
						reject(err);
					});
			});
		};

		// Wait for FFmpeg to finish before DB update
		await runFfmpeg();
		
		// Dynamically add input files
		// record.media.forEach(file => command.input('temp_uploads/'+file.path));
		
		// command
		// 	.complexFilter(generateFilter(record.media))
		// 	.outputOptions(['-map [outv]', '-c:v libx264', '-r 30', '-preset fast'])
		// 	.save(outputFile)
		// 	.on('progress', (progress) => console.log(`Processing: ${progress.percent}% done`))
		// 	.on('end', () => console.log('Merging completed!'))
		// 	.on('error', (err) => console.error('Error:', err.message));

		await prisma.apc_ads.update({
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
