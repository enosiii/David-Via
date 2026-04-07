const { getRequiredEnv } = require('../_lib/push');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return res.status(200).json({
      publicKey: getRequiredEnv('VAPID_PUBLIC_KEY'),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
