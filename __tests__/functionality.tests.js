const axios = require('axios');
const {
  getAccessToken,
  fetchTransactions,
  filterNewTransactions,
  formatMessage,
  sendResultToTelex,
} = require('../src/utils/functionality');

jest.mock('axios'); // Mock axios for all tests

describe('functionality.js tests', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('getAccessToken', () => {
    it('should fetch an access token successfully', async () => {
      const mockToken = 'mockAccessToken';
      axios.post.mockResolvedValue({ data: { access_token: mockToken } });

      const token = await getAccessToken('clientId', 'clientSecret');
      expect(token).toBe(mockToken);
    });

    it('should throw an error if unable to fetch token', async () => {
      axios.post.mockRejectedValue(new Error('Error fetching token'));

      await expect(getAccessToken('clientId', 'clientSecret')).rejects.toThrow(
        'Error fetching token'
      );
    });
  });

  describe('fetchTransactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = {
        transaction_details: [{ transaction_info: {} }],
      };
      axios.get.mockResolvedValue({ data: mockTransactions });

      const result = await fetchTransactions('mockToken');
      expect(result).toEqual(mockTransactions.transaction_details);
    });

    it('should throw an error if unable to fetch transactions', async () => {
      axios.get.mockRejectedValue(new Error('Error fetching transactions'));

      await expect(fetchTransactions('mockToken')).rejects.toThrow(
        'Error fetching transactions'
      );
    });
  });

  describe('filterNewTransactions', () => {
    it('should filter out already processed transactions', () => {
      const transactions = [
        {
          transaction_info: {
            transaction_initiation_date: '2025-02-19T12:00:00Z',
          },
        },
        {
          transaction_info: {
            transaction_initiation_date: '2025-02-18T12:00:00Z',
          },
        },
      ];
      // Set lastTransactionTime for testing purposes
      global.lastTransactionTime = new Date('2025-02-18T12:30:00Z');
      const newTransactions = filterNewTransactions(transactions);
      expect(newTransactions.length).toBe(1);
    });

    it('should return an empty array if no new transactions are found', () => {
      const transactions = [
        {
          transaction_info: {
            transaction_initiation_date: '2025-02-17T12:00:00Z',
          },
        },
      ];
      global.lastTransactionTime = new Date('2025-02-18T12:00:00Z');
      const newTransactions = filterNewTransactions(transactions);
      expect(newTransactions.length).toBe(0);
    });
  });

  describe('formatMessage', () => {
    it('should format transaction message correctly', () => {
      const transaction = {
        transaction_info: {
          transaction_id: '123ABC',
          transaction_amount: { value: '50', currency_code: 'USD' },
          transaction_status: 'Completed',
        },
      };
      const message = formatMessage(transaction);
      expect(message).toBe(
        'New Payment: ID 123ABC, Amount: 50 USD, Status: Completed'
      );
    });
  });

  describe('sendResultToTelex', () => {
    it('should send result to Telex successfully', async () => {
      axios.post.mockResolvedValue({});
      await sendResultToTelex('mockUrl', 'Message');
      expect(axios.post).toHaveBeenCalledWith('mockUrl', {
        message: 'Message',
        username: 'Paypal-Payments-Notification',
        event_name: 'Payment Notification',
        status: 'success',
      });
    });

    it('should log an error if sending to Telex fails', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      axios.post.mockRejectedValue(new Error('Error sending to Telex'));
      await sendResultToTelex('mockUrl', 'Message');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending result to Telex:',
        'Error sending to Telex'
      );
      consoleSpy.mockRestore(); // Restore the original console.error
    });
  });
});
