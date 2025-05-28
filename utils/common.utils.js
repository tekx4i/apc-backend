import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cleans up pending bookings that have expired
 * Runs every 5 minutes via cron job
 */
export const cleanPendingBookings = async () => {
	try {
        console.log('Cleaning pending bookings...');
		const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

		// Find and delete pending bookings older than 30 minutes
		const result = await prisma.apc_ads_booking.findMany({
			where: {
				status: 'PENDING',
				created_at: { lte: thirtyMinutesAgo }
			},
			select: {
				id: true
			}
		});

		if (result.length > 0) {
			const bookingIds = result.map(booking => booking.id);
			await prisma.apc_ads_booking_details.deleteMany({
				where: {
					booking_id: {
						in: bookingIds
					}
				}
			});

			await prisma.apc_ads_booking.updateMany({
				where: {
					id: {
						in: bookingIds
					}
				},
				data: {
					status: 'EXPIRED'
				}
			});
		}
	} catch (error) {
		console.error('Error cleaning pending bookings:', error);
	}
};
