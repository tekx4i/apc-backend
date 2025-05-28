import { Router } from 'express';

import {
	getPlaylist,
	deletePlaylist,
	getAllPlaylists,
	// createPlaylist,
	// updatePlaylist,
	getCurrentPlaylist,
	getNextPlaylist,
	deleteManyPlaylist,
} from '../controllers';
import { validate, isAdmin } from '../middlewares';
import {
	PlaylistIdSchema,
	getPlaylistSchema,
	// addPlaylistSchema,
	deletePlaylistsSchema,
	// updatePlaylistSchema,
	getCurrentPlaylistSchema,
} from '../validations';

const router = Router();

router.get('/current', validate(getCurrentPlaylistSchema), getCurrentPlaylist);
router.get('/next', validate(getCurrentPlaylistSchema), getNextPlaylist);
router.get('/', isAdmin, validate(getPlaylistSchema), getAllPlaylists);
router.get('/:id', isAdmin, validate(PlaylistIdSchema), getPlaylist);
// router.post('/', isAdmin, validate(addPlaylistSchema), createPlaylist);
// router.put('/:id', isAdmin, validate(updatePlaylistSchema), updatePlaylist);
router.delete('/:id', isAdmin, validate(PlaylistIdSchema), deletePlaylist);
router.delete(
	'/',
	isAdmin,
	validate(deletePlaylistsSchema),
	deleteManyPlaylist,
);

export const PlaylistRoutes = router;
