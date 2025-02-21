const axios = require('axios');
/**
 * Retrieves a PayPal access token using your client credentials.
 */
async function getAccessToken(clientId, secret) {
  const baseUrl = process.env.PAYPAL_API_URL || 'https://api.paypal.com';
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');

  try {
    const response = await axios.post(
      `${baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      'Error fetching PayPal access token:',
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = getAccessToken;
