/**
 * Master validation: typecheck + i18n + affiliate audit.
 * Exits non-zero on any failure so CI can gate on this single command.
 */
import { spawnSync } from "node:child_process";

const checks = [
  { name: "typecheck", cmd: "npm", args: ["run", "typecheck"] },
  { name: "audit:i18n", cmd: "npm", args: ["run", "audit:i18n"] },
  { name: "audit:affiliate", cmd: "npm", args: ["run", "audit:affiliate"] },
];

let failed = 0;
for (const c of checks) {
  process.stdout.write(`\n→ ${c.name}\n`);
  const r = spawnSync(c.cmd, c.args, { stdio: "inherit" });
  if (r.status !== 0) {
    failed++;
    process.stdout.write(`✗ ${c.name} failed\n`);
  } else {
    process.stdout.write(`✓ ${c.name}\n`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll validation passed.");
