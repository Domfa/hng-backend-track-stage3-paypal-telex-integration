const fetchTransactions = require('./fetchTransactions');
const filterNewTransactions = require('./filterNewTransactions');
const getAccessToken = require('./getPayPalAccessToken');
const processTelexRequest = require('./processTelexRequest');
const formatMessage = require('./formatMessage');
const sendResultToTelex = require('./sendResultToTelex');

module.exports = {
  fetchTransactions,
  filterNewTransactions,
  getAccessToken,
  processTelexRequest,
  formatMessage,
  sendResultToTelex,
};
