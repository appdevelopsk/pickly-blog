// Shared GA4 auth + bot-exclusion filters for the ga4-*.mjs report scripts.
//
// Why two axes, not one:
//   The OS axis alone (operatingSystem in [Linux, (not set)]) was believed to be
//   "the cleanest single axis". It is not. A second headless band reports macOS /
//   Windows and only shows up on screenResolution: a handful of fixed sizes with
//   0-6s dwell, Chrome, concentrated in CN/VN. On 2026-09-01 that band evaporated
//   on its own and made a *rising* real audience look like a traffic decline.
//   Both axes are required for CLEAN to mean anything.
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const KEY = JSON.parse(
  readFileSync('/Users/ken/Dropbox/pickly/.secrets/ga4-service-account.json', 'utf8'),
);

export const PROPS = {
  pickly: '537610479',
  toolify: '538597795',
  fxea365: '538098098',
  nattzy: '542086855',
};

const b64u = (o) =>
  Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

export async function token() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64u({ alg: 'RS256', typ: 'JWT' })}.${b64u({
    iss: KEY.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(KEY.private_key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${sig}`,
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(JSON.stringify(j));
  return j.access_token;
}

export async function report(tok, prop, body) {
  const r = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${prop}:runReport`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return (j.rows ?? []).map((x) => ({
    d: (x.dimensionValues ?? []).map((v) => v.value),
    m: (x.metricValues ?? []).map((v) => Number(v.value)),
  }));
}

// --- axis 1: the OS band. Real Linux desktop readers are a rounding error here.
export const EXCLUDE_HEADLESS_OS = {
  notExpression: {
    filter: { fieldName: 'operatingSystem', inListFilter: { values: ['Linux', '(not set)'] } },
  },
};

// --- axis 2: the fixed-viewport band. Fingerprinted 2026-09-01 on pickly+toolify:
// every one of these sizes ran 0-6s average dwell and collapsed in lockstep.
// None is a common real device viewport (1280x800 / 1366x768 / 1920x1080 are the
// real ones and are deliberately NOT listed here).
export const BOT_RESOLUTIONS = ['1280x1200', '1440x900', '1600x1200', '800x600'];

export const EXCLUDE_HEADLESS_RES = {
  notExpression: {
    filter: { fieldName: 'screenResolution', inListFilter: { values: BOT_RESOLUTIONS } },
  },
};

// CLEAN = both headless axes removed. This is the default for any report that
// claims to describe readers. Replaces the old single-axis EXCLUDE_HEADLESS.
export const CLEAN = {
  andGroup: { expressions: [EXCLUDE_HEADLESS_OS, EXCLUDE_HEADLESS_RES] },
};

// Channels that a human arrived through. Direct is excluded on purpose: on these
// properties Direct is where the residual automated traffic pools, and no real
// acquisition work targets it.
export const REAL_CHANNELS = [
  'Organic Search',
  'AI Assistant',
  'Organic Social',
  'Referral',
  'Organic Video',
  'Organic Shopping',
];

// REAL = CLEAN, minus Direct. Use for trend claims ("is the audience growing?").
// Use CLEAN, not REAL, when you need absolute traffic including bookmarks/dark social.
export const REAL = {
  andGroup: {
    expressions: [
      EXCLUDE_HEADLESS_OS,
      EXCLUDE_HEADLESS_RES,
      {
        filter: {
          fieldName: 'sessionDefaultChannelGroup',
          inListFilter: { values: REAL_CHANNELS },
        },
      },
    ],
  },
};

// Compose CLEAN/REAL with an extra dimensionFilter expression.
export const withFilter = (base, ...extra) => ({
  andGroup: { expressions: [...(base.andGroup?.expressions ?? [base]), ...extra] },
});
