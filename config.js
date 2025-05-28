import dotenv from 'dotenv';

const envFiles = {
	development: '.env.development',
	production: '.env.production',
	staging: '.env.staging',
};

dotenv.config({ path: envFiles[process.env.NODE_ENV] });

export const {
	NODE_ENV,
	PORT,
	ACCESS_TOKEN_SECRET,
	ACCESS_TOKEN_EXPIRY,
	OTP_TOKEN_SECRET,
	OTP_TOKEN_EXPIRY,
	RATE_LIMIT_WINDOW,
	RATE_LIMIT_MAX,
	FROM_NAME,
	FROM_EMAIL,
	SMTP_PASS,
	SMTP_HOST,
	SMTP_PORT,
	STRIPE_SECRET_KEY,
	ADMIN_EMAIL,
	// CLOUDINARY_CLOUD_NAME,
	// CLOUDINARY_API_KEY,
	// CLOUDINARY_API_SECRET,
	// CLOUDINARY_FOLDER,
	// SG_API_KEY,
	// SG_SENDER_EMAIL,
} = process.env;
