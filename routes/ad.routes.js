import multer from 'multer';
import { Router } from 'express';

import {
	getAllAds,
	getAd,
	createAd,
	updateAd,
	deleteAd,
	deleteManyAd,
} from '../controllers';
import { validate, isAuth, upload, tempUpload, processFiles } from '../middlewares';
import {
	getAdSchema,
	addAdSchema,
	AdIdSchema,
	updateAdSchema,
	deleteAdsSchema,
} from '../validations';

const router = Router();

router.get('/', isAuth, validate(getAdSchema), getAllAds);
router.get('/:id', isAuth, validate(AdIdSchema), getAd);
router.post(
	'/', 
	isAuth, 
	tempUpload.array('media', 10),
	validate(addAdSchema), 
	processFiles,
	createAd
);
router.put('/:id', isAuth, upload.array('media', 10), validate(updateAdSchema), updateAd);
router.delete('/:id', isAuth, validate(AdIdSchema), deleteAd);
router.delete(
	'/',
	isAuth,
	validate(deleteAdsSchema),
	deleteManyAd,
);

export const AdRoutes = router;
