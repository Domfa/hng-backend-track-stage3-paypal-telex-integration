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

module.exports = filterNewTransactions;
