import { ConfigError, ProviderGetUserError, TokenError } from '../../utils/errors';
import { parseQuerystring } from '../../utils/helpers';

async function getTokensFromCode(code, { clientId, clientSecret, redirectUrl }) {
  console.log('[redirectUrl]', redirectUrl);

  const params = `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUrl}`;
  const token = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(`https://accounts.spotify.com/api/token?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${token}`,
    },
  });
  const result = await response.json();
  console.log('[tokens]', result);

  if (result.error) {
    throw new TokenError({
      message: result.error_description,
    });
  }
  return result;
}

async function getUser(token) {
  try {
    const getUserResponse = await fetch(
      'https://api.spotify.com/v1/me',
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await getUserResponse.json();
    console.log('[provider user data]', data);
    return data;
  } catch (e) {
    console.log('[get user error]', e);
    throw new ProviderGetUserError({
      message: 'There was an error fetching the user',
    });
  }
}

export default async function callback({ options, request }) {
    const { query } = parseQuerystring(request);
    console.log('[query]', query);
    if (!query.code) {
      throw new ConfigError({
        message: 'No code is paased!',
      });
    }
    const tokens = await getTokensFromCode(query.code, options);
    const accessToken = tokens.access_token;
    const providerUser = await getUser(accessToken);
    return {
      user: providerUser,
      tokens
    };
}
