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
        'https://cdn.brandfetch.io/id-Wd4a4TS/theme/dark/idCerXwXCa.svg?c=1bx1742623151377id64Mup7ac0_ViWH0a&t=1727787911932',
      app_url: 'http://ec2-34-217-144-139.us-west-2.compute.amazonaws.com/',
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
      'http://ec2-34-217-144-139.us-west-2.compute.amazonaws.com/web-hook',
  },
};

module.exports = integrationSpecSettings;
