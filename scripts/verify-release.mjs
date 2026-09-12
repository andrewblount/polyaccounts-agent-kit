import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
for (const kind of ['demo', 'hosted']) {
  const metadata = JSON.parse(await readFile(new URL(`../registry/${kind}.json`, import.meta.url), 'utf8'));
  for (const pkg of metadata.packages) {
    const response = await fetch(pkg.identifier, { signal: AbortSignal.timeout(60000) });
    assert.ok(response.ok, `Release artifact returned ${response.status}`);
    const digest = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
    assert.equal(digest, pkg.fileSha256, `${kind} release hash differs from registry metadata`);
    console.log(`${kind} release hash verified`);
  }
}
