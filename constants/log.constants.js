export const INVALID_LOG_ID = 'Invalid Log ID';
export const LOG_NOT_FOUND = 'Log Not Found';
export const GET_LOG_SUCCESS = 'Logs fetched successfully';
export const LOG_CREATED_SUCCESS = 'Log created successfully';
export const LOG_UPDATED_SUCCESS = 'Log updated successfully';
export const LOG_DELETED_SUCCESS = 'Log deleted successfully';

export const ALLOWED_LOG_SORT_OPTIONS = [
	'id',
	'device_id',
	'location_id',
	'play_list_id',
	'temperature',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_LOG_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_LOG_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_LOG_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'device_id',
		type: 'number',
	},
	{
		propertyName: 'location_id',
		type: 'number',
	},
	{
		propertyName: 'play_list_id',
		type: 'number',
	},
	{
		propertyName: 'temperature',
		type: 'number',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_LOG_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_LOG_SORT_OPTIONS.includes(field);
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
