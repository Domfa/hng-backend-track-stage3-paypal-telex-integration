const axios = require('axios');
/**
 * Retrieves a PayPal access token using your client credentials.
 */

let lastTransactionTime = new Date(0);

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

/**
 * Fetches transactions from PayPal between the last processed time and now.
 */

async function fetchTransactions(accessToken) {
  const baseUrl = process.env.PAYPAL_API_URL || 'https://api.paypal.com';

  // Get the current time and subtract 24 hours to set the start date
  const now = new Date();
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

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

/**
 * Filters out transactions that have already been processed.
 * Also updates lastTransactionTime to the most recent transaction time.
 */
function filterNewTransactions(transactions) {
  const newTransactions = transactions.filter((txn) => {
    const txnTime = new Date(txn.transaction_info.transaction_initiation_date);
    return txnTime > lastTransactionTime;
  });

  if (newTransactions.length > 0) {
    // Update lastTransactionTime to the latest transaction timestamp
    const latestTime = newTransactions.reduce((max, txn) => {
      const txnTime = new Date(
        txn.transaction_info.transaction_initiation_date
      );
      return txnTime > max ? txnTime : max;
    }, lastTransactionTime);
    lastTransactionTime = latestTime;
  }
  return newTransactions;
}

/**
 * Formats a transaction into a human-readable notification message.
 */
function formatMessage(transaction) {
  const info = transaction.transaction_info;
  // Check if available_balance is provided in the transaction info
  const availableBalance = info.available_balance
    ? `${info.available_balance.value} ${info.available_balance.currency_code}`
    : 'N/A';

  // Format the message with bullet points and newlines
  return `New Payment Notification:
    • Transaction ID: ${info.transaction_id}
    • Amount: ${info.transaction_amount.value} ${info.transaction_amount.currency_code}
    • Status: ${info.transaction_status}
    • Date: ${info.transaction_initiation_date}
    • Available Balance: ${availableBalance}\n\n`;
}

/**
 * Sends the result back to Telex using the provided return_url.
 * The payload follows the Telex webhook format:
 * {
 *    "message": "Your message",
 *    "username": "Paypal-Payments-Notification",
 *    "event_name": "Payment Notification",
 *    "status": "success"  or "error"
 * }
 */
async function sendResultToTelex(returnUrl, message, status = 'success') {
  const data = {
    message: message,
    username: 'Paypal-Payments-Notification',
    event_name: 'Payment Notification',
    status: status,
  };

  try {
    await axios.post(returnUrl, data);
    console.log('Result sent to Telex:', data);
  } catch (error) {
    console.error('Error sending result to Telex:', error.message);
  }
}

/**
 * Main tick processing function.
 * It obtains an access token, fetches transactions, filters new ones,
 * formats a message, and sends the result to the Telex return_url.
 */
async function processTelexRequest(payload) {
  try {
    // Extract client_id and client_secret from the settings array
    const clientIdSetting = payload.settings.find(
      (setting) => setting.label === 'paypalClientId'
    );
    const clientSecretSetting = payload.settings.find(
      (setting) => setting.label === 'paypalSecret'
    );

    if (!clientIdSetting || !clientSecretSetting) {
      throw new Error(
        'PayPal client credentials not provided in the settings.'
      );
    }

    const client_id = clientIdSetting.default;
    const client_secret = clientSecretSetting.default;
    const { return_url } = payload;

    // Obtain access token using credentials from the payload
    const accessToken = await getAccessToken(client_id, client_secret);
    const transactions = await fetchTransactions(accessToken);
    const newTransactions = filterNewTransactions(transactions);

    let message;
    if (newTransactions.length === 0) {
      message = 'No new transactions found.';
    } else {
      message = newTransactions.map((txn) => formatMessage(txn)).join('\n');
    }

    await sendResultToTelex(return_url, message);
  } catch (error) {
    await sendResultToTelex(
      payload.return_url,
      `Error processing transactions: ${error.message}`,
      'error'
    );
  }
}

module.exports = module.exports = {
  getAccessToken,
  fetchTransactions,
  filterNewTransactions,
  formatMessage,
  sendResultToTelex,
  processTelexRequest,
};
