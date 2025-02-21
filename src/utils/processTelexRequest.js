const {
  fetchTransactions,
  filterNewTransactions,
  getAccessToken,
  formatMessage,
  sendResultToTelex,
} = require('../utils');

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

module.exports = processTelexRequest;
