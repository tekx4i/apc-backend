import { startOfDay } from 'date-fns';

export const INVALID_PLAYLIST_ID = 'Invalid Playlist ID';
export const PLAYLIST_NOT_FOUND = 'Playlist Not Found';
export const GET_PLAYLIST_SUCCESS = 'Playlists fetched successfully';
export const PLAYLIST_CREATED_SUCCESS = 'Playlist created successfully';
export const PLAYLIST_UPDATED_SUCCESS = 'Playlist updated successfully';
export const PLAYLIST_DELETED_SUCCESS = 'Playlist deleted successfully';

export const ALLOWED_PLAYLIST_SORT_OPTIONS = [
	'id',
	'date',
	'number',
	'location_id',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_PLAYLIST_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_PLAYLIST_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_PLAYLIST_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'date',
		type: 'date',
		transform: value => {
			return value ? startOfDay(value) : value;
		},	
	},
	{
		propertyName: 'number',
		type: 'number',
	},
	{
		propertyName: 'location_id',
		type: 'number',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_PLAYLIST_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_PLAYLIST_SORT_OPTIONS.includes(field);
				const isValidDirection = ALLOWED_SORT_DIRECTION.includes(direction);
				return isValidField && isValidDirection;
			},
		},
	},
	{
		propertyName: 'page',
		type: 'number',
		min: 1,
	},
	{
		propertyName: 'limit',
		type: 'number',
		min: 1,
	},
];
