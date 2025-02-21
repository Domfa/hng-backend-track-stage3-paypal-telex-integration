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

module.exports = sendResultToTelex;
