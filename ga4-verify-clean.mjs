// Verify the two-axis CLEAN filter against the old single-axis one.
import { token, report, PROPS, EXCLUDE_HEADLESS_OS, CLEAN, REAL } from './ga4-filters.mjs';
const tok = await token();
const M=[{name:'sessions'},{name:'averageSessionDuration'},{name:'screenPageViews'}];
const R=[{name:'p1',startDate:'55daysAgo',endDate:'28daysAgo'},{name:'p0',startDate:'27daysAgo',endDate:'yesterday'}];
const f=v=>v?`${String(v[0]).padStart(5)}s ${v[1].toFixed(0).padStart(4)}秒 pv/s ${(v[2]/(v[0]||1)).toFixed(2)}`:'  -';
for (const [name,id] of Object.entries(PROPS)) {
  console.log(`\n### ${name}`);
  for (const [label,filt] of [['OLD (OS only)',EXCLUDE_HEADLESS_OS],['NEW CLEAN  ',CLEAN],['NEW REAL   ',REAL]]) {
    const rows=await report(tok,id,{dateRanges:R,metrics:M,dimensionFilter:filt});
    const m={}; for(const r of rows) m[r.d[0]??'p0']=r.m;
    console.log(`  ${label}  p1:${f(m.p1)} | p0:${f(m.p0)}`);
  }
}
