const webPush = require('web-push');

const WEDDING_DATE = '2026-04-08'; //2026-07-11
const MANILA_TIMEZONE = 'Asia/Manila';

const REMINDER_MESSAGES = {
  30: {
    stageKey: '30_days',
    title: 'One Month To Go',
    body: 'Only one month left until our wedding day on July 11, 2026.',
  },
  21: {
    stageKey: '21_days',
    title: 'Three Weeks To Go',
    body: 'Three weeks left. We are excited to celebrate with you soon.',
  },
  14: {
    stageKey: '14_days',
    title: 'Two Weeks To Go',
    body: 'Two weeks left until we say "I do".',
  },
  7: {
    stageKey: '7_days',
    title: 'One Week To Go',
    body: 'Just one week to go. We cannot wait to celebrate with you.',
  },
  6: {
    stageKey: '6_days',
    title: '6 Days To Go',
    body: 'Only 6 days left until our wedding day.',
  },
  5: {
    stageKey: '5_days',
    title: '5 Days To Go',
    body: '5 days left. We are almost there.',
  },
  4: {
    stageKey: '4_days',
    title: '4 Days To Go',
    body: '4 days to go until our celebration begins.',
  },
  3: {
    stageKey: '3_days',
    title: '3 Days To Go',
    body: '3 days left. Thank you for being part of our special day.',
  },
  2: {
    stageKey: '2_days',
    title: '2 Days To Go',
    body: 'Only 2 days left until our wedding day.',
  },
  1: {
    stageKey: '1_day',
    title: 'Tomorrow Is The Day',
    body: 'Tomorrow is our wedding day. We are so excited to celebrate with you.',
  },
};

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getSupabaseConfig() {
  return {
    url: getRequiredEnv('SUPABASE_URL'),
    serviceRoleKey: getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

function getBaseHeaders() {
  const { serviceRoleKey } = getSupabaseConfig();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };
}

async function supabaseRequest(path, options = {}) {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...getBaseHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatDateInManila(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: MANILA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
}

function toUtcMidnight(dateString) {
  return new Date(`${dateString}T00:00:00Z`);
}

function getDaysUntilWedding() {
  const today = formatDateInManila();
  const diffMs = toUtcMidnight(WEDDING_DATE).getTime() - toUtcMidnight(today).getTime();
  return Math.round(diffMs / 86400000);
}

function getReminderPayload(daysUntilWedding) {
  const reminder = REMINDER_MESSAGES[daysUntilWedding];
  if (!reminder) {
    return null;
  }

  return {
    ...reminder,
    sentDate: formatDateInManila(),
    icon: '/assets/icon192.png',
    badge: '/assets/icon192.png',
    url: '/',
  };
}

function configureWebPush() {
  webPush.setVapidDetails(
    'mailto:notifications@david-via-wedding.vercel.app',
    getRequiredEnv('VAPID_PUBLIC_KEY'),
    getRequiredEnv('VAPID_PRIVATE_KEY')
  );
}

function mapSubscriptionRow(subscription, userAgent = '') {
  return {
    endpoint: subscription.endpoint,
    p256dh: subscription.keys && subscription.keys.p256dh ? subscription.keys.p256dh : '',
    auth: subscription.keys && subscription.keys.auth ? subscription.keys.auth : '',
    is_active: true,
    user_agent: userAgent,
    updated_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  };
}

async function upsertPushSubscription(subscription, userAgent = '') {
  const row = mapSubscriptionRow(subscription, userAgent);
  const data = await supabaseRequest('david_via_push_subscriptions?on_conflict=endpoint', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([row]),
  });

  return data;
}

async function getActivePushSubscriptions() {
  return supabaseRequest(
    'david_via_push_subscriptions?select=endpoint,p256dh,auth,is_active&is_active=eq.true'
  );
}

async function deactivatePushSubscription(endpoint) {
  const query = new URLSearchParams({ endpoint: `eq.${endpoint}` });
  return supabaseRequest(`david_via_push_subscriptions?${query.toString()}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      is_active: false,
      updated_at: new Date().toISOString(),
    }),
  });
}

async function hasReminderBeenSent(stageKey, sentDate) {
  const query = new URLSearchParams({
    select: 'id',
    stage_key: `eq.${stageKey}`,
    sent_date: `eq.${sentDate}`,
    limit: '1',
  });

  const data = await supabaseRequest(`david_via_push_notification_logs?${query.toString()}`, {
    method: 'GET',
  });

  return Array.isArray(data) && data.length > 0;
}

async function createReminderLog(stageKey, sentDate, sentCount) {
  return supabaseRequest('david_via_push_notification_logs', {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify([
      {
        stage_key: stageKey,
        sent_date: sentDate,
        sent_count: sentCount,
      },
    ]),
  });
}

async function sendReminderNotification(payload) {
  configureWebPush();
  const subscriptions = await getActivePushSubscriptions();

  let sentCount = 0;

  for (const row of subscriptions) {
    const subscription = {
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    };

    try {
      await webPush.sendNotification(
        subscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          tag: payload.stageKey,
          icon: payload.icon,
          badge: payload.badge,
          url: payload.url,
        })
      );
      sentCount += 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await deactivatePushSubscription(row.endpoint);
        continue;
      }

      throw error;
    }
  }

  await createReminderLog(payload.stageKey, payload.sentDate, sentCount);
  return sentCount;
}

function parseJsonBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return req.body;
}

module.exports = {
  WEDDING_DATE,
  getDaysUntilWedding,
  getReminderPayload,
  hasReminderBeenSent,
  mapSubscriptionRow,
  parseJsonBody,
  sendReminderNotification,
  upsertPushSubscription,
  getRequiredEnv,
};
