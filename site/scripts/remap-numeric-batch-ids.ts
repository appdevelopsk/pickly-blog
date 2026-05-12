/**
 * Some sub-agents wrote row numbers (1-based) in the first column of their
 * result TSV instead of the offerId. This script reads the original input
 * batch file (line N → offerId from column 1) and rewrites the result file
 * with offerIds replacing numeric IDs.
 *
 * Skips result files that already use offerIds (no numeric first column).
 */
import fs from "node:fs";

const files = fs.readdirSync("/tmp").filter((f) => /^img-batch-\d+-result\.tsv$/.test(f));

let totalRemapped = 0;

for (const f of files) {
  const num = f.match(/(\d+)-result\.tsv$/)?.[1];
  if (!num) continue;
  const inputBatch = `/tmp/img-batch-${num}`;
  const resultPath = `/tmp/${f}`;
  if (!fs.existsSync(inputBatch)) {
    console.log(`! missing input batch: ${inputBatch}`);
    continue;
  }

  // Build line-number → offerId map from input batch (1-based)
  const inputLines = fs.readFileSync(inputBatch, "utf8").split("\n").filter(Boolean);
  const idByRow = new Map<number, string>();
  inputLines.forEach((line, i) => {
    const first = line.split("\t")[0];
    if (first) idByRow.set(i + 1, first);
  });

  const resultLines = fs.readFileSync(resultPath, "utf8").split("\n").filter(Boolean);
  const out: string[] = [];
  let remapped = 0;
  for (const line of resultLines) {
    const [first, ...rest] = line.split("\t");
    if (/^\d+$/.test(first)) {
      const row = parseInt(first, 10);
      const offerId = idByRow.get(row);
      if (offerId) {
        out.push([offerId, ...rest].join("\t"));
        remapped++;
      } else {
        // unknown row number, drop
      }
    } else {
      out.push(line);
    }
  }
  if (remapped > 0) {
    fs.writeFileSync(resultPath, out.join("\n") + "\n", "utf8");
    console.log(`${f}: remapped ${remapped}/${resultLines.length} rows`);
    totalRemapped += remapped;
  }
}

console.log(`\nTotal rows remapped: ${totalRemapped}`);
