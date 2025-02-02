import { ConfigError } from '../../utils/errors';

export default async function redirect({ options }) {
	const {
		clientId,
		redirectUrl,
		scope = 'openid email profile',
		responseType = 'code',
		state = 'pass-through value'
	} = options;
	if (!clientId) {
		throw new ConfigError({
			message: 'No client id passed'
		});
	}

	const params = `client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scope}&include_granted_scopes=true&state=${state}`;

	const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
	return url;
}
