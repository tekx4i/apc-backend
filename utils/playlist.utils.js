import { PrismaClient } from '@prisma/client';
import ffmpeg from 'fluent-ffmpeg';
import HttpStatus from 'http-status-codes';
import { AppError } from '../errors';
import { sendEmail } from './email.utils';
import { ADMIN_EMAIL } from '../config';

const prisma = new PrismaClient();

export const createPlaylistsForAllLocations = async () => {
    try {
        const locations = await prisma.apc_locations.findMany({
            where: {
                is_deleted: false,
            },
            select: {
                id: true
            }
        });
        // const today = new Date().toISOString().split('T')[0];
        const today = new Date(
                    new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })).setDate(new Date().getDate() + 1)
                ).toISOString().split('T')[0];

        for (const location of locations) {
            try {
                await createDailyPlaylists(today, location.id);
                console.log(`Created playlists for location ${location.id}`);
            } catch (error) {
                console.error(`Error creating playlists for location ${location.id}:`, error.message);
                
                // Send email notification to admin about the error
                sendEmail({
                    to: ADMIN_EMAIL,
                    subject: 'Playlist Creation Error',
                    html: `
                        <h2>Error Creating Playlists</h2>
                        <p><strong>Location ID:</strong> ${location.id}</p>
                        <p><strong>Date:</strong> ${today}</p>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p><strong>Stack:</strong> ${error.stack || 'Not available'}</p>
                    `,
                    text: `Error Creating Playlists for Location ${location.id} on ${today}: ${error.message}`
                });
                
                continue;
            }
        }

        return true;
    } catch (error) {
        console.error('Error in createPlaylistsForAllLocations:', error);
        
        // Send email notification to admin about the critical error
        sendEmail({
            to: ADMIN_EMAIL,
            subject: 'Critical Playlist System Error',
            html: `
                <h2>Critical Error in Playlist Creation System</h2>
                <p><strong>Error:</strong> ${error.message}</p>
                <p><strong>Stack:</strong> ${error.stack || 'Not available'}</p>
            `,
            text: `Critical Error in Playlist Creation System: ${error.message}`
        });
        
        throw new AppError('Failed to create playlists for locations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
};


const getAvailableAdsForDate = async (date, locationId) => {
    const bookings = await prisma.apc_ads_booking_details.findMany({
        where: {
            date: new Date(date),
            booking: {
                status: 'CONFIRMED',
                location_id: parseInt(locationId),
            },
        },
        select: {
            id: true,
            duration: true,
            date: true,
            booking: {
                select: {
                    id: true,
                    status: true,
                    ad: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            video_url: true,
                            status: true,
                        }
                    }
                }
            }
        }
    });

    return bookings;
};

const createDailyPlaylists = async (date, locationId) => {
    const MAX_PLAYLISTS = 3;
    const PLAYLIST_DURATION = 180;
    
    let availableAds = await getAvailableAdsForDate(date, locationId);
    
    if (!availableAds.length) {
        throw new AppError('No available ads for this date', HttpStatus.NOT_FOUND);
    }
    
    const playlists = [];
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    for (let i = 0; i < MAX_PLAYLISTS; i++) {
        if (availableAds.length === 0) {
            break; // Stop creating playlists if we run out of ads
        }
        
        const playlistNumber = i + 1;
        const playlistName = `${formattedDate}-${locationId}-${playlistNumber}`;

        const playlist = await prisma.apc_play_list.create({ 
            data: {
                info: playlistName,
                date: new Date(date),
                number: playlistNumber,
                total_time: PLAYLIST_DURATION,
                location_id: parseInt(locationId),
                status: 'ACTIVE',
            } 
        });
        const selectedAds = selectAdsForPlaylist(availableAds, PLAYLIST_DURATION);
        
        await createPlaylistAdsEntries(playlist.id, selectedAds);
        
        await generatePlaylistVideo(playlist.id);
        
        playlists.push({
            ...playlist,
            ads: selectedAds
        });
        
        const selectedAdIds = new Set(selectedAds.map(ad => ad.id));
        availableAds = availableAds.filter(ad => !selectedAdIds.has(ad.id));
    }
    return playlists;
};

const selectAdsForPlaylist = (availableAds, maxDuration) => {
    let remainingDuration = maxDuration;
    const selectedAds = [];
    const usedAdIds = new Set();
    
    for (let i = 0; i < availableAds.length; i++) {
        const ad = availableAds[i];
        
        if (ad.duration <= remainingDuration) {
            selectedAds.push(ad);
            usedAdIds.add(ad.id);
            remainingDuration -= ad.duration;
        }
        
        if (remainingDuration === 0) break;
    }
    
    if (remainingDuration > 0) {
        for (let i = 0; i < availableAds.length; i++) {
            const ad = availableAds[i];
            
            if (!usedAdIds.has(ad.id) && ad.duration === remainingDuration) {
                selectedAds.push(ad);
                usedAdIds.add(ad.id);
                remainingDuration = 0;
                break;
            }
        }
    }
    
    if (remainingDuration === 15 || remainingDuration === 30) {
        const potentialSwaps = findPotentialSwaps(selectedAds, availableAds, usedAdIds, remainingDuration);
        
        if (potentialSwaps.length > 0) {
            const bestSwap = potentialSwaps[0];
            
            const swapOutIndex = selectedAds.findIndex(ad => ad.id === bestSwap.removeAdId);
            if (swapOutIndex !== -1) {
                selectedAds.splice(swapOutIndex, 1);
                
                bestSwap.addAds.forEach(ad => {
                    selectedAds.push(ad);
                });
                
                remainingDuration = bestSwap.newRemainingDuration;
            }
        }
    }
    
    return selectedAds;
};

const findPotentialSwaps = (selectedAds, availableAds, usedAdIds, remainingDuration) => {
    const potentialSwaps = [];
    
    for (const selectedAd of selectedAds) {
        const freedUpDuration = selectedAd.duration;
        const potentialDuration = freedUpDuration + remainingDuration;
        
        const unusedAds = availableAds.filter(ad => !usedAdIds.has(ad.id) || ad.id === selectedAd.id);
        
        for (let i = 0; i < unusedAds.length; i++) {
            const firstAd = unusedAds[i];
            if (firstAd.id === selectedAd.id) continue;
            
            if (firstAd.duration === potentialDuration) {
                potentialSwaps.push({
                    removeAdId: selectedAd.id,
                    addAds: [firstAd],
                    newRemainingDuration: 0
                });
                continue;
            }
            
            for (let j = i + 1; j < unusedAds.length; j++) {
                const secondAd = unusedAds[j];
                if (secondAd.id === selectedAd.id) continue;
                
                const combinedDuration = firstAd.duration + secondAd.duration;
                
                // If the combination is better than current selection
                if (combinedDuration <= potentialDuration && 
                    (potentialDuration - combinedDuration) < remainingDuration) {
                    potentialSwaps.push({
                        removeAdId: selectedAd.id,
                        addAds: [firstAd, secondAd],
                        newRemainingDuration: potentialDuration - combinedDuration
                    });
                }
            }
        }
    }
    
    return potentialSwaps.sort((a, b) => a.newRemainingDuration - b.newRemainingDuration);
};

const createPlaylistAdsEntries = async (playlistId, bookings) => {
    const playlistAdsData = bookings.map((booking, index) => ({
        playlist_id: parseInt(playlistId),
        ad_id: parseInt(booking.booking.ad.id),
        description: `${index}`,
    }));
    await prisma.apc_play_list_ads.createMany({
        data: playlistAdsData
    });
};

export const generatePlaylistVideo = async (playlistId) => {
    try {
        const playlist = await prisma.apc_play_list.findUnique({
            where: { 
                id: parseInt(playlistId),
            },
            include: {
                play_list_ads: {
                    include: {
                        ad: true
                    }
                }
            }
        });
        
        if (!playlist) {
            throw new AppError('Playlist not found', HttpStatus.NOT_FOUND);
        }
        
        const ads = playlist.play_list_ads.map(pa => pa.ad); 
        
        if (ads.length === 0) {
            throw new AppError('No ads in playlist', HttpStatus.BAD_REQUEST);
        }
        
        const fileName = `${playlist.info}.mp4`;
        const outputFile = `temp_uploads/playlists/${fileName}`;
        
        const command = ffmpeg();
        
        for (const ad of ads) {
            if (ad.video_url) {
                command.input(`temp_uploads/ads/${ad.video_url}`);
            } else {
                console.warn(`Ad ${ad.id} has no video`);
                
                // Send warning email about missing video
                sendEmail({
                    to: ADMIN_EMAIL,
                    subject: 'Warning: Missing Ad Video',
                    html: `
                        <h2>Warning: Ad Missing Video File</h2>
                        <p><strong>Playlist ID:</strong> ${playlistId}</p>
                        <p><strong>Ad ID:</strong> ${ad.id}</p>
                        <p><strong>Ad Name:</strong> ${ad.name || 'Not available'}</p>
                    `,
                    text: `Warning: Ad ${ad.id} in Playlist ${playlistId} is missing its video file`
                });
            }
        }
        
        // Filter out ads without videos
        const validAds = ads.filter(ad => ad.video_url);
        
        if (validAds.length === 0) {
            throw new AppError('No valid ad videos for this playlist', HttpStatus.BAD_REQUEST);
        }
        
        const filterComplex = validAds
            .map((_, index) => `[${index}:v]`)
            .join('') + 
            `concat=n=${validAds.length}:v=1:a=0[outv]`;

        await new Promise((resolve, reject) => {
            command
                .complexFilter(filterComplex)
                .outputOptions(['-map [outv]', '-c:v libx264', '-r 30', '-preset fast'])
                .save(outputFile)
                .on('progress', (progress) => {
                    console.log(`Processing playlist: ${progress.percent}% done`);
                })
                .on('end', () => {
                    console.log('Playlist video created successfully!');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error creating playlist video:', err.message);
                    sendEmail({
                        to: ADMIN_EMAIL,
                        subject: 'Error: Playlist Video Generation Failed',
                        html: `
                            <h2>Error: Failed to Generate Playlist Video</h2>
                            <p><strong>Playlist ID:</strong> ${playlistId}</p>
                            <p><strong>Error:</strong> ${err.message}</p>
                        `,
                        text: `Error: Failed to generate video for Playlist ${playlistId}: ${err.message}`,
                    });
                    reject(err);
                });
        })
        
        // command
        //     .complexFilter(filterComplex)
        //     .outputOptions(['-map [outv]', '-c:v libx264', '-r 30', '-preset fast'])
        //     .save(outputFile)
        //     .on('progress', (progress) => console.log(`Processing playlist: ${progress.percent}% done`))
        //     .on('end', () => console.log('Playlist video created successfully!'))
        //     .on('error', async (err) => {
        //         console.error('Error creating playlist video:', err.message);
                
        //         // Send email notification about video generation error
        //         sendEmail({
        //             to: ADMIN_EMAIL,
        //             subject: 'Error: Playlist Video Generation Failed',
        //             html: `
        //                 <h2>Error: Failed to Generate Playlist Video</h2>
        //                 <p><strong>Playlist ID:</strong> ${playlistId}</p>
        //                 <p><strong>Error:</strong> ${err.message}</p>
        //             `,
        //             text: `Error: Failed to generate video for Playlist ${playlistId}: ${err.message}`
        //         });
        //     });
        
        await prisma.apc_play_list.update({ 
            where: { id: parseInt(playlistId) },
            data: { video_url: fileName }
        });
        
        return {
            ...playlist,
            video_url: fileName
        };
    } catch (error) {
        console.error(`Error generating video for playlist ${playlistId}:`, error);
        
        // Send email notification about the error
        sendEmail({
            to: ADMIN_EMAIL,
            subject: 'Error: Playlist Video Generation Failed',
            html: `
                <h2>Error: Failed to Generate Playlist Video</h2>
                <p><strong>Playlist ID:</strong> ${playlistId}</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <p><strong>Stack:</strong> ${error.stack || 'Not available'}</p>
            `,
            text: `Error: Failed to generate video for Playlist ${playlistId}: ${error.message}`
        });
        
        throw error;
    }
};
