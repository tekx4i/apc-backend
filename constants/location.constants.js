export const INVALID_LOCATION_ID = 'Invalid Location ID';
export const LOCATION_NOT_FOUND = 'Location Not Found';
export const GET_LOCATION_SUCCESS = 'Locations fetched successfully';
export const LOCATION_CREATED_SUCCESS = 'Location created successfully';
export const LOCATION_UPDATED_SUCCESS = 'Location updated successfully';
export const LOCATION_DELETED_SUCCESS = 'Location deleted successfully';

export const ALLOWED_LOCATION_SORT_OPTIONS = [
	'id',
	'name',
	'lat_long',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_LOCATION_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_LOCATION_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_LOCATION_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'lat_long',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_LOCATION_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_LOCATION_SORT_OPTIONS.includes(field);
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
