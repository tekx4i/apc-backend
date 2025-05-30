export function generateRandomString(minLength, maxLength) {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	const length =
		Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

	let result = '';
	for (let i = 0; i < length; i += 1) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}
