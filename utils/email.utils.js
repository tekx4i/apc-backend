// import ElasticMail from 'nodelastic';
// // import sgMail from '@sendgrid/mail';

// import { 
// 	// SG_API_KEY, 
// 	// SG_SENDER_EMAIL,
// 	SMTP_PASS,
// 	FROM_NAME,
// 	FROM_EMAIL,
// } from '../config';

// // sgMail.setApiKey(SG_API_KEY);

// // export const sendEmail = async msg => {
// // 	return sgMail.send({ ...msg, from: SG_SENDER_EMAIL });
// // };

// const client = new ElasticMail(SMTP_PASS);

// export const sendEmail = async mailOptions => {
// 	try {
// 		client.send({
// 			from: FROM_EMAIL,
// 			fromName: FROM_NAME,
// 			subject: mailOptions.subject,
// 			msgTo: [mailOptions.to],
// 			bodyHtml: mailOptions.html,
// 			textHtml: mailOptions.text,
// 		});
// 	} catch (error) {
// 		// eslint-disable-next-line no-console
// 		console.error('Error sending email:', error);
// 	}
// };

import nodemailer from 'nodemailer';
import { SMTP_PASS, SMTP_HOST, SMTP_PORT, FROM_NAME, FROM_EMAIL } from '../config';

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT || 587,
	secure: false,
	auth: {
		user: FROM_EMAIL,
		pass: SMTP_PASS,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

export const sendEmail = async (mailOptions) => {
	try {
		await transporter.sendMail({
			from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
			to: mailOptions.to,
			subject: mailOptions.subject,
			text: mailOptions.text,
			html: mailOptions.html,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Error sending email:', error);
	}
};
