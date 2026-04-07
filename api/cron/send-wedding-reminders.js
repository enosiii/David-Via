const {
  getReminderPayload,
  hasReminderBeenSent,
  sendReminderNotification,
} = require('../_lib/push');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = getReminderPayload();

    if (!payload) {
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'No reminder configured for today',
      });
    }

    const alreadySent = await hasReminderBeenSent(payload.stageKey, payload.sentDate);
    if (alreadySent) {
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: `Reminder ${payload.stageKey} already sent for ${payload.sentDate}`,
      });
    }

    const sentCount = await sendReminderNotification(payload);

    return res.status(200).json({
      success: true,
      reminderType: payload.type,
      stageKey: payload.stageKey,
      sentCount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
