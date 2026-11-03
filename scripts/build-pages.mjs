import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../dist/', import.meta.url));
const html = await readFile(join(output, 'index.html'), 'utf8');
// GitHub Pages serves directory indexes, so known React routes also work when
// opened directly or refreshed, without a redirect through an error page.
const routes = ['cv', 'about', 'resume', 'contact', 'work/emotional-vacuum',
  'work/pcg-project', 'work/mixed-lives', 'work/dku-campus-tour'];
for (const route of routes) {
  const directory = join(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), html);
}
await writeFile(join(output, '404.html'), html);
await writeFile(join(output, '.nojekyll'), '');
console.log(`Prepared ${routes.length} direct-entry routes for GitHub Pages.`);
