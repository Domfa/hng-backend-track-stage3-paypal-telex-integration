const axios = require('axios');
/**
 * Fetches transactions from PayPal between the last processed time and now.
 */

async function fetchTransactions(accessToken) {
  const baseUrl = process.env.PAYPAL_API_URL || 'https://api.paypal.com';

  // Get the current time and subtract 24 hours to set the start date
  const now = new Date();
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const endDate = now.toISOString();

  try {
    const response = await axios.get(`${baseUrl}/v1/reporting/transactions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data.transaction_details || [];
  } catch (error) {
    console.error(
      'Error fetching transactions:',
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = fetchTransactions;
