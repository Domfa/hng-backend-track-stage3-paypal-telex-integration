const integrationSpecSettings = {
  data: {
    date: {
      created_at: '2025-02-19',
      updated_at: '2025-02-19',
    },
    descriptions: {
      app_name: 'Paypal-Payments-Notification',
      app_description:
        'An integration that polls the PayPal API for new transactions and posts payment alerts to a Telex channel.',
      app_logo:
        'https://cdn.pixabay.com/photo/2018/05/03/21/49/paypal-3372585_1280.png',
      app_url:
        'https://hng-backend-track-stage3-paypal-telex-3d94.onrender.com',
      background_color: '#ffffff',
    },
    is_active: true,
    integration_category: 'Finance & Payments',
    integration_type: 'interval',
    key_features: [
      'Periodically polls PayPal for new transactions',
      'Formats transaction details into alert messages',
      'Posts payment notifications to a designated Telex channel',
      'Automatically handles access token refresh and error reporting',
      'Configurable polling intervals and channel settings.',
    ],
    author: 'Domfa',
    settings: [
      {
        label: 'paypalClientId',
        type: 'text',
        required: true,
        default: '',
      },
      {
        label: 'paypalSecret',
        type: 'text',
        required: true,
        default: '',
      },
      {
        label: 'Time interval',
        type: 'text',
        required: true,
        default: '*/5 * * * *',
      },
    ],
    target_url: '',
    tick_url:
      'https://hng-backend-track-stage3-paypal-telex-3d94.onrender.com/tick',
  },
};

module.exports = integrationSpecSettings;
