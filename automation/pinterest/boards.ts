/**
 * List your Pinterest boards (pick the right ID for PINTEREST_DEFAULT_BOARD_ID).
 */
import { PinterestClient } from "./client";

async function main() {
  const client = new PinterestClient();
  const r = await client.listBoards();
  for (const b of r.items) {
    console.log(`${b.id}\t${b.name}`);
  }
}

main();
