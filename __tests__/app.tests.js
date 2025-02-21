const request = require('supertest');
const app = require('../src/app');
const { processTelexRequest } = require('../src/utils/functionality');

jest.mock('../src/utils/functionality', () => {
  return {
    processTelexRequest: jest.fn().mockResolvedValue(),
  };
});

describe('app.js tests', () => {
  let server;
  let port;

  beforeAll((done) => {
    // Listen on a random available port by specifying 0
    server = app.listen(0, () => {
      port = server.address().port;
      console.log(`Test server running on port ${port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /integration-config', () => {
    it('should return integration config with settings property', async () => {
      const response = await request(app).get('/integration-config');
      expect(response.statusCode).toBe(200);
      // The integration config is wrapped in a "data" object
      expect(response.body.data).toHaveProperty('settings');
    });
  });

  describe('POST /tick', () => {
    it('should respond with status 202 and process the tick', async () => {
      const payload = {
        settings: [
          { label: 'paypalClientId', default: 'test_client_id' },
          { label: 'paypalSecret', default: 'test_client_secret' },
        ],
        return_url: 'http://example.com',
      };

      const response = await request(app).post('/tick').send(payload);
      expect(response.statusCode).toBe(202);
      expect(response.body).toEqual({ status: 'accepted' });
      // Verify that processTelexRequest is called with the payload
      expect(processTelexRequest).toHaveBeenCalledWith(payload);
    });

    it('should handle errors gracefully', async () => {
      // Simulate an error in processTelexRequest by rejecting the promise
      processTelexRequest.mockRejectedValueOnce(new Error('Test error'));
      const payload = {
        settings: [
          { label: 'paypalClientId', default: 'test_client_id' },
          { label: 'paypalSecret', default: 'test_client_secret' },
        ],
        return_url: 'http://example.com',
      };

      const response = await request(app).post('/tick').send(payload);
      expect(response.statusCode).toBe(202);
      expect(response.body).toEqual({ status: 'accepted' });
      expect(processTelexRequest).toHaveBeenCalledWith(payload);
      // Note: Because the error is handled in the background, the HTTP response is always 202.
      // We don't assert calls to sendResultToTelex here since that's internal to processTelexRequest.
    });
  });

  describe('GET /health', () => {
    it('should return a healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });
});
