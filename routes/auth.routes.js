import { Router } from 'express';

import {
	login,
	register,
	OtpVerify,
	ResendOTP,
	ForgotPassword,
	ResetPassword,
	getLoggedInUser,
} from '../controllers';
import {
	validate,
	checkAuth,
	varifyOTP,
	isAuth,
	resetCheck,
} from '../middlewares';
import {
	loginSchema,
	registerSchema,
	verifySchema,
	resendOTPSchema,
	forgotSchema,
	resetSchema,
} from '../validations';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/verify/:id', validate(verifySchema), varifyOTP, OtpVerify);
router.get('/resendOTP/:id', validate(resendOTPSchema), ResendOTP);
router.post('/forgot', validate(forgotSchema), ForgotPassword);
router.post('/reset/:id', resetCheck, validate(resetSchema), ResetPassword);
router.get('/me', isAuth, getLoggedInUser);

// router.get('/getUsers', getUsers);

export const AuthRoutes = router;
