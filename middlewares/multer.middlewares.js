import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { ulid } from 'ulid';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'temp_uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, `${ulid()}.${file.originalname.split('.').pop()}`);
	},
});
const tempStorage = multer.memoryStorage();

export const upload = multer({
	storage,
	fileFilter: (_req, file, cb) => {
		const [fileType, _fileSubtype] = file.mimetype.split('/');
		cb(null, true);

		// if (fileType === 'image') {
		// 	cb(null, true)
		// } else {
		// 	// throw new AppError(AD_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);
		// 	cb(new AppError('File format not supported', 400), false);
		// }
	},
});

export const tempUpload = multer({
	storage: tempStorage,
	fileFilter: (_req, file, cb) => {
		const [fileType, _fileSubtype] = file.mimetype.split('/');
		cb(null, true);

		// if (fileType === 'image') {
		// } else {
		// 	// throw new AppError(AD_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);
		// 	cb(new AppError('File format not supported', 400), false);
		// }
	},
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processFiles = async (req, res, next) => {
    const uploadFolder = path.join(__dirname, '../temp_uploads');

    for (const file of req.files) {
        let filename = `${ulid()}.${file.originalname.split('.').pop()}`;
        file.filename = filename;
        const filePath = path.join(uploadFolder, filename);
        
        fs.writeFileSync(filePath, file.buffer);
        
        if (file.mimetype.startsWith('video/')) {
            file.duration = await getVideoDuration(filePath);
        }
    }

    return next();
};

const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata.format.duration);
            }
        });
    });
};
