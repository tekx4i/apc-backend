import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import responseTime from 'response-time';

import { PORT } from './config';
import {
	errorMiddleware,
	notFound,
	// rateLimiter
} from './middlewares';
import {
	AdRoutes,
	AuthRoutes,
	userRoutes,
	DeviceRoutes,
	BookingRoutes,
	PackageRoutes,
	PaymentRoutes,
	LocationRoutes,
	PlaylistRoutes,
	RoleRoutes,
	LogRoutes,
} from './routes';
import { registerCronJob, startAllJobs, cleanPendingBookings, createPlaylistsForAllLocations } from './utils';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(rateLimiter);
app.use(compression());
app.use(morgan('dev'));
app.use(responseTime());

app.use(cors({ origin: '*' }));

app.use('/public', express.static(path.join(path.resolve(), 'temp_uploads')));
app.use(express.static(path.join(path.resolve(), 'public')));

app.use(helmet());

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/ad', AdRoutes);
app.use('/api/v1/booking', BookingRoutes);
app.use('/api/v1/device', DeviceRoutes);
app.use('/api/v1/location', LocationRoutes);
app.use('/api/v1/package', PackageRoutes);
app.use('/api/v1/payment', PaymentRoutes);
app.use('/api/v1/playlist', PlaylistRoutes);
app.use('/api/v1/role', RoleRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/log', LogRoutes);

app.get('/home', (req, res) => {
	createPlaylistsForAllLocations();
	res.status(200).json({ data: 'Server is running' });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.get('/folder', (req, res) => {
// 	const crudName = 'payment';
// 	const replacements = ['Payment','PAYMENT','payment','.apc_payments.'];
// 		const folders = [
// 		'constants',
// 		'controllers',
// 		'routes',
// 		'validations',
// 		'services',
// 	];

// 	folders.forEach(folder => {
// 		const sourceFilePath = path.join(__dirname, folder, `spice.${folder}.js`);
// 		const destinationFileName = `${crudName}.${folder}.js`;
// 		const destinationFilePath = path.join(
// 			__dirname,
// 			folder,
// 			destinationFileName,
// 		);
// 		const indexFilePath = path.join(__dirname, folder, 'index.js');

// 		fs.copyFile(sourceFilePath, destinationFilePath, err => {
// 			if (err) {
// 				console.error(`Error copying file in ${folder}:`, err);
// 			} else {
// 				console.log(`File copied in ${folder} as ${destinationFileName}`);

// 				fs.readFile(destinationFilePath, 'utf8', (readErr, data) => {
// 					if (readErr) {
// 						console.error(`Error reading file in ${folder}:`, readErr);
// 					} else {
// 						const updatedContent = data
// 							.replace(/\.spices\./g, replacements[3])
// 							.replace(/Spice/g, replacements[0])
// 							.replace(/SPICE/g, replacements[1])
// 							.replace(/spice/g, replacements[2]);

// 						fs.writeFile(
// 							destinationFilePath,
// 							updatedContent,
// 							'utf8',
// 							writeErr => {
// 								if (writeErr) {
// 									console.error(`Error writing file in ${folder}:`, writeErr);
// 								} else {
// 									console.log(`File updated in ${folder} with replacements`);

// 									const exportLine = `export * from './${crudName}.${folder}';\n`;
// 									fs.appendFile(indexFilePath, exportLine, appendErr => {
// 										if (appendErr) {
// 											console.error(
// 												`Error appending to index.js in ${folder}:`,
// 												appendErr,
// 											);
// 										} else {
// 											console.log(`Export line added to index.js in ${folder}`);
// 										}
// 									});
// 								}
// 							},
// 						);
// 					}
// 				});
// 			}
// 		});
// 	});

// 	res
// 		.status(200)
// 		.json({
// 			data: 'Files copied, updated, and export line added successfully',
// 		});
// });

app.use('*', notFound);
app.use(errorMiddleware);

if (!fs.existsSync('./temp_uploads/ads')) {
	fs.mkdirSync('./temp_uploads/ads', { recursive: true });
	// eslint-disable-next-line no-console
	console.log('temp_uploads folder created!');
}
if (!fs.existsSync('./temp_uploads/playlists')) {
	fs.mkdirSync('./temp_uploads/playlists', { recursive: true });
	// eslint-disable-next-line no-console
	console.log('playlists folder created!');
}

registerCronJob(
  	'cleanPendingBookings',
  	'*/5 * * * *', // Run every 5 minutes
  	cleanPendingBookings,
  	{
    	scheduled: true,
    	timezone: 'Asia/Karachi'
  	}
);

registerCronJob(
  	'createPlaylistsForAllLocations',
  	'0 20 * * *', // Run at 08:00 PM every day
  	createPlaylistsForAllLocations,
  	{
    	scheduled: true,
    	timezone: 'Asia/Karachi'
  	}
);

startAllJobs();

app.listen(PORT || 3000, () => {
	// eslint-disable-next-line no-console
	console.log(`Server is listening at port ${PORT}`);
});
