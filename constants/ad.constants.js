export const INVALID_AD_ID = 'Invalid Ad ID';
export const AD_NOT_FOUND = 'Ad Not Found';
export const GET_AD_SUCCESS = 'Ads fetched successfully';
export const AD_CREATED_SUCCESS = 'Ad created successfully';
export const AD_UPDATED_SUCCESS = 'Ad updated successfully';
export const AD_DELETED_SUCCESS = 'Ad deleted successfully';

export const ALLOWED_AD_SORT_OPTIONS = [
	'id',
	'name',
	'description',
	'count',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_AD_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_AD_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_AD_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'count',
		type: 'number',
	},
	{
		propertyName: 'author_id',
		type: 'number',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_AD_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_AD_SORT_OPTIONS.includes(field);
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
