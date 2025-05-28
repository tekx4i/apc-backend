export const INVALID_DEVICE_ID = 'Invalid Device ID';
export const DEVICE_NOT_FOUND = 'Device Not Found';
export const GET_DEVICE_SUCCESS = 'Devices fetched successfully';
export const DEVICE_CREATED_SUCCESS = 'Device created successfully';
export const DEVICE_UPDATED_SUCCESS = 'Device updated successfully';
export const DEVICE_DELETED_SUCCESS = 'Device deleted successfully';

export const ALLOWED_DEVICE_SORT_OPTIONS = [
	'id',
	'name',
	'ip',
	'info',
	'location_id',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_DEVICE_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_DEVICE_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_DEVICE_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'ip',
		type: 'string',
	},
	{
		propertyName: 'info',
		type: 'string',
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
			message: INVALID_DEVICE_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_DEVICE_SORT_OPTIONS.includes(field);
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
