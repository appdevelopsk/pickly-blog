// Clean baseline: metrics with the headless fingerprint excluded via dimensionFilter.
// Auth, property ids and the exclusion filters live in ga4-filters.mjs -- keep them
// there so every report script shares one definition of "bot".
import { token, report as rawReport, PROPS, CLEAN, REAL } from './ga4-filters.mjs';

const START = process.argv[2] ?? '28daysAgo';
const END = process.argv[3] ?? 'yesterday';


// CLEAN (OS band + fixed-viewport band) comes from ga4-filters.mjs. The earlier
// version of this file excluded only the OS axis and called it "the cleanest single
// axis"; that was wrong -- a second headless band reports macOS/Windows and is only
// visible on screenResolution. See ga4-filters.mjs for the fingerprint.

const M = [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'activeUsers' },
           { name: 'averageSessionDuration' }, { name: 'screenPageViews' }];

const report = (tok, prop, body) =>
  rawReport(tok, prop, { dateRanges: [{ startDate: START, endDate: END }], ...body });

const tok = await token();

console.log(`GA4 clean baseline  ${START}..${END}`);
console.log('clean = headless OS band + bot viewport band excluded');
console.log('real  = clean, minus Direct (where the residual automation pools)\n');

for (const [name, prop] of Object.entries(PROPS)) {
  const raw = (await report(tok, prop, { metrics: M }))[0].m;
  const cln = (await report(tok, prop, { metrics: M, dimensionFilter: CLEAN }))[0].m;
  const rl = (await report(tok, prop, { metrics: M, dimensionFilter: REAL }))[0]?.m ?? [0,0,0,0,0];

  const fmt = (m) => ({
    sess: m[0], eng: m[1], users: m[2], dur: m[3], pv: m[4],
    engRate: 100 * m[1] / (m[0] || 1),
    pvPerSess: m[4] / (m[0] || 1),
  });
  const r = fmt(raw), c = fmt(cln), t = fmt(rl);

  console.log(`${'='.repeat(64)}\n${name}\n${'='.repeat(64)}`);
  console.log(`                     raw ->   clean ->    real`);
  console.log(`  sessions        ${String(r.sess).padStart(6)} -> ${String(c.sess).padStart(7)} -> ${String(t.sess).padStart(7)}   (${(100*(r.sess-c.sess)/(r.sess||1)).toFixed(0)}% of raw was bot)`);
  console.log(`  users           ${String(r.users).padStart(6)} -> ${String(c.users).padStart(7)} -> ${String(t.users).padStart(7)}`);
  console.log(`  avg duration    ${r.dur.toFixed(1).padStart(5)}s -> ${c.dur.toFixed(1).padStart(6)}s -> ${t.dur.toFixed(1).padStart(6)}s`);
  console.log(`  engagement rate ${r.engRate.toFixed(1).padStart(5)}% -> ${c.engRate.toFixed(1).padStart(6)}% -> ${t.engRate.toFixed(1).padStart(6)}%`);
  console.log(`  pv / session    ${r.pvPerSess.toFixed(2).padStart(6)} -> ${c.pvPerSess.toFixed(2).padStart(7)} -> ${t.pvPerSess.toFixed(2).padStart(7)}   <== the real lever`);
  console.log();
}
