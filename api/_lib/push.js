const webPush = require('web-push');

const WEDDING_DATE = '2026-07-11'; //2026-07-11
const RSVP_DEADLINE = '2026-06-11';
const MANILA_TIMEZONE = 'Asia/Manila';
const HOME_URL = 'https://david-via-wedding.vercel.app/';
const STORY_URL = 'https://david-via-wedding.vercel.app/story.html';
const WISHES_URL = 'https://david-via-wedding.vercel.app/wishes.html';
const GAME_URL = 'https://david-via-wedding.vercel.app/mgame.html';
const RSVP_URL = 'https://david-via-wedding.vercel.app/rsvp.html';

const WEDDING_REMINDER_MESSAGES = {
  30: {
    stageKey: '30_days',
    title: 'One Month To Go',
    body: 'Only one month left until our wedding day on July 11, 2026.',
    url: HOME_URL,
  },
  21: {
    stageKey: '21_days',
    variants: [
      {
        title: 'Three Weeks To Go',
        body: 'Three weeks left. We are excited to celebrate with you soon.',
        url: HOME_URL,
      },
      {
        title: 'Send Your Wishes',
        body: 'If you have a sweet note for us, you can already leave it on our wishes page.',
        url: WISHES_URL,
      },
      {
        title: 'Look Back On Our Story',
        body: 'Take a quiet look back on our story as the wedding day gets closer.',
        url: STORY_URL,
      },
    ],
  },
  14: {
    stageKey: '14_days',
    variants: [
      {
        title: 'Two Weeks To Go',
        body: 'Two weeks left until we say "I do".',
        url: HOME_URL,
      },
      {
        title: 'We Would Love Your Wishes',
        body: 'If you have not yet sent a message, you can leave your wishes for us anytime.',
        url: WISHES_URL,
      },
      {
        title: 'Our Story Is Waiting',
        body: 'Look back on our story and some of the moments that brought us here.',
        url: STORY_URL,
      },
    ],
  },
  7: {
    stageKey: '7_days',
    variants: [
      {
        title: 'One Week To Go',
        body: 'Just one week to go. We cannot wait to celebrate with you.',
        url: HOME_URL,
      },
      {
        title: 'Elegant Attire Awaits',
        body: 'We cannot wait to see you in your elegant attire on our special day.',
        url: HOME_URL,
      },
      {
        title: 'Play Our Mini Game',
        body: 'Play our mini game and try to top the leaderboard to win exciting prizes.',
        url: GAME_URL,
      },
      {
        title: 'Send Your Wishes',
        body: 'We would love to read your messages before the wedding day arrives.',
        url: WISHES_URL,
      },
    ],
  },
  6: {
    stageKey: '6_days',
    title: '6 Days To Go',
    body: 'Only 6 days left until our wedding day.',
    url: HOME_URL,
  },
  5: {
    stageKey: '5_days',
    variants: [
      {
        title: '5 Days To Go',
        body: '5 days left. We are almost there.',
        url: HOME_URL,
      },
      {
        title: 'A Little Wedding Fun',
        body: 'Play our mini game and see if you can climb to the top of the leaderboard.',
        url: GAME_URL,
      },
      {
        title: 'A Quick Walk Through Our Story',
        body: 'Take a moment to look back on our story before the big day.',
        url: STORY_URL,
      },
    ],
  },
  4: {
    stageKey: '4_days',
    title: '4 Days To Go',
    body: '4 days to go until our celebration begins.',
    url: HOME_URL,
  },
  3: {
    stageKey: '3_days',
    variants: [
      {
        title: '3 Days To Go',
        body: '3 days left. Thank you for being part of our special day.',
        url: HOME_URL,
      },
      {
        title: 'See You In Elegant Attire',
        body: 'We cannot wait to see everyone dressed beautifully for the celebration.',
        url: HOME_URL,
      },
      {
        title: 'Still Time To Send Your Wishes',
        body: 'If you want to leave a message for us, our wishes page is waiting for you.',
        url: WISHES_URL,
      },
    ],
  },
  2: {
    stageKey: '2_days',
    title: '2 Days To Go',
    body: 'Only 2 days left until our wedding day.',
    url: HOME_URL,
  },
  1: {
    stageKey: '1_day',
    variants: [
      {
        title: 'Tomorrow Is The Day',
        body: 'Tomorrow is our wedding day. We are so excited to celebrate with you.',
        url: HOME_URL,
      },
      {
        title: 'Tomorrow We Celebrate',
        body: 'Tomorrow is the day. We cannot wait to see you and celebrate together.',
        url: HOME_URL,
      },
      {
        title: 'One Last Look Back',
        body: 'Before tomorrow arrives, take one last look back on our story with us.',
        url: STORY_URL,
      },
    ],
  },
};

const RSVP_REMINDER_MESSAGES = {
  7: {
    stageKey: 'rsvp_7_days',
    title: 'RSVP Deadline In 7 Days',
    body: 'Our RSVP deadline is 7 days away. Please confirm your attendance when you can.',
    url: RSVP_URL,
  },
  3: {
    stageKey: 'rsvp_3_days',
    title: 'RSVP Deadline In 3 Days',
    body: 'Only 3 days left before our RSVP deadline. We would love to hear from you.',
    url: RSVP_URL,
  },
  1: {
    stageKey: 'rsvp_1_day',
    title: 'RSVP Deadline Tomorrow',
    body: 'Tomorrow is the RSVP deadline. Please confirm your attendance today if you have not yet responded.',
    url: RSVP_URL,
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

  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
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

function getDaysUntilDate(targetDate) {
  const today = formatDateInManila();
  const diffMs = toUtcMidnight(targetDate).getTime() - toUtcMidnight(today).getTime();
  return Math.round(diffMs / 86400000);
}

function getDaysUntilWedding() {
  return getDaysUntilDate(WEDDING_DATE);
}

function getDaysUntilRsvpDeadline() {
  return getDaysUntilDate(RSVP_DEADLINE);
}

function pickReminderVariant(reminder) {
  if (!reminder.variants || reminder.variants.length === 0) {
    return reminder;
  }

  const index = Math.floor(Math.random() * reminder.variants.length);
  return {
    ...reminder,
    ...reminder.variants[index],
  };
}

function getWeddingReminderPayload(daysUntilWedding) {
  const reminder = WEDDING_REMINDER_MESSAGES[daysUntilWedding];
  if (!reminder) {
    return null;
  }

  const selectedReminder = pickReminderVariant(reminder);

  return {
    ...selectedReminder,
    sentDate: formatDateInManila(),
    icon: '/assets/icon192.webp',
    badge: '/assets/icon192.webp',
    url: selectedReminder.url || HOME_URL,
  };
}

function getRsvpReminderPayload(daysUntilDeadline) {
  const reminder = RSVP_REMINDER_MESSAGES[daysUntilDeadline];
  if (!reminder) {
    return null;
  }

  return {
    ...reminder,
    sentDate: formatDateInManila(),
    icon: '/assets/icon192.webp',
    badge: '/assets/icon192.webp',
    url: reminder.url || RSVP_URL,
  };
}

function getReminderPayload() {
  const rsvpReminder = getRsvpReminderPayload(getDaysUntilRsvpDeadline());
  if (rsvpReminder) {
    return {
      ...rsvpReminder,
      type: 'rsvp_deadline',
    };
  }

  const weddingReminder = getWeddingReminderPayload(getDaysUntilWedding());
  if (weddingReminder) {
    return {
      ...weddingReminder,
      type: 'wedding_day',
    };
  }

  return null;
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
  RSVP_DEADLINE,
  getDaysUntilWedding,
  getDaysUntilRsvpDeadline,
  getReminderPayload,
  hasReminderBeenSent,
  mapSubscriptionRow,
  parseJsonBody,
  sendReminderNotification,
  upsertPushSubscription,
  getRequiredEnv,
};
