/**
 * Formats a transaction into a human-readable notification message.
 */
function formatMessage(transaction) {
  const info = transaction.transaction_info;
  return `New Payment: ID ${info.transaction_id}, Amount: ${info.transaction_amount.value} ${info.transaction_amount.currency_code}, Status: ${info.transaction_status}`;
}

module.exports = formatMessage;
