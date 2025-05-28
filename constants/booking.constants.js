import { startOfDay, endOfDay } from 'date-fns';

export const INVALID_BOOKING_ID = 'Invalid Booking ID';
export const BOOKING_NOT_FOUND = 'Booking Not Found';
export const GET_BOOKING_SUCCESS = 'Bookings fetched successfully';
export const BOOKING_CREATED_SUCCESS = 'Booking created successfully';
export const BOOKING_UPDATED_SUCCESS = 'Booking updated successfully';
export const BOOKING_DELETED_SUCCESS = 'Booking deleted successfully';

export const ALLOWED_BOOKING_SORT_OPTIONS = [
	'id',
	'name',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_BOOKING_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_BOOKING_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_BOOKING_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'ad_id',
		type: 'number',
	},
	{
		propertyName: 'location_id',
		type: 'number',
	},
	{
		propertyName: 'payment_id',
		type: 'number',
	},
	{
		propertyName: 'user_id',
		type: 'number',
	},
	{
		propertyName: 'status',
		type: 'string',
	},
	{
		propertyName: 'total_duration',
		type: 'number',
	},
	{
		propertyName: 'start_date',
		type: 'date',
		transform: value => {
			const date = new Date(value);
			return date.getHours() === 0 && date.getMinutes() === 0 ? date : startOfDay(date);
		},
	},
	{
		propertyName: 'end_date',
		type: 'date',
		transform: value => {
			const date = new Date(value);
			return date.getHours() === 0 && date.getMinutes() === 0 ? date : endOfDay(date);
		},
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_BOOKING_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_BOOKING_SORT_OPTIONS.includes(field);
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
