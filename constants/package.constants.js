export const INVALID_PACKAGE_ID = 'Invalid Package ID';
export const PACKAGE_NOT_FOUND = 'Package Not Found';
export const GET_PACKAGE_SUCCESS = 'Packages fetched successfully';
export const PACKAGE_CREATED_SUCCESS = 'Package created successfully';
export const PACKAGE_UPDATED_SUCCESS = 'Package updated successfully';
export const PACKAGE_DELETED_SUCCESS = 'Package deleted successfully';

export const ALLOWED_PACKAGE_SORT_OPTIONS = [
	'id',
	'name',
	'description',
	'duration',
	'price',
	'status',
	'created_by',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_PACKAGE_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_PACKAGE_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_PACKAGE_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'duration',
		type: 'number',
	},
	{
		propertyName: 'price',
		type: 'number',
	},
	{
		propertyName: 'status',
		type: 'string',
	},
	{
		propertyName: 'created_by',
		type: 'number',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_PACKAGE_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_PACKAGE_SORT_OPTIONS.includes(field);
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
