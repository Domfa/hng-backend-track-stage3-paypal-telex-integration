require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const integrationSpecSettings = require('../config/telex-integration-specs');
const { processTelexRequest } = require('./utils/functionality');

const app = express();
const PORT = process.env.PORT || 4000;

// Parse incoming JSON payloads
app.use(bodyParser.json());
app.use(cors());

//The /integrration-config endpoint returns the integration requierments
app.get('/integration-config', (req, res) => {
  res.status(200).json(integrationSpecSettings);
});

//The /tick endpoint is called by Telex on the interval specified in your integration settings.
app.post('/tick', (req, res) => {
  const payload = req.body;
  console.log('Tick received:', payload);

  // Immediately acknowledge the tick request
  res.status(202).json({ status: 'accepted' });

  // Process the tick in the background
  processTelexRequest(payload).catch((err) => {
    console.error('Error in background processing:', err);
  });
});

//Health check endpoint.
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
