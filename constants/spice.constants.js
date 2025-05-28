export const INVALID_SPICE_ID = 'Invalid Spice ID';
export const SPICE_NOT_FOUND = 'Spice Not Found';
export const GET_SPICE_SUCCESS = 'Spices fetched successfully';
export const SPICE_CREATED_SUCCESS = 'Spice created successfully';
export const SPICE_UPDATED_SUCCESS = 'Spice updated successfully';
export const SPICE_DELETED_SUCCESS = 'Spice deleted successfully';

export const ALLOWED_SPICE_SORT_OPTIONS = [
	'id',
	'name',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_SPICE_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_SPICE_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_SPICE_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
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
			message: INVALID_SPICE_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_SPICE_SORT_OPTIONS.includes(field);
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
