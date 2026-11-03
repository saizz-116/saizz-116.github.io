import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';
import { parseLayoutDocument } from '../src/editor/layout';

const apiRoot = '/__portfolio-editor/';
const maxBodyBytes = 64 * 1024;

function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(data));
}

function localOrigin(req: IncomingMessage): string | null {
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '')) return null;
  try {
    const host = new URL(`http://${req.headers.host ?? ''}`);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(host.hostname)
      || host.username || host.password || host.pathname !== '/' || host.search || host.hash) return null;
    return host.origin;
  } catch {
    return null;
  }
}

function hasToken(req: IncomingMessage, token: string): boolean {
  const received = req.headers['x-portfolio-editor-token'];
  if (typeof received !== 'string' || !/^[a-f0-9]{64}$/.test(received) || received.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(token));
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let oversized = false;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        oversized = true;
        chunks.length = 0;
      } else if (!oversized) {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      if (oversized) {
        reject(Object.assign(new Error('Layout is too large.'), { status: 413 }));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Invalid JSON.'), { status: 400 }));
      }
    });
    req.on('error', reject);
    req.on('aborted', () => reject(new Error('Request was interrupted.')));
  });
}

async function persistLayout(root: string, outDir: string, layout: unknown) {
  const source = join(root, 'public', 'home-layout.json');
  const output = join(outDir, 'home-layout.json');
  const files = existsSync(outDir) ? [source, output] : [source];
  const suffix = `.tmp-${randomBytes(8).toString('hex')}`;
  const data = `${JSON.stringify(layout, null, 2)}\n`;
  const previous = await Promise.all(files.map(async (file) => {
    try { return await readFile(file); } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }));
  const replaced: number[] = [];
  try {
    for (const file of files) {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(`${file}${suffix}`, data, { flag: 'wx' });
    }
    for (const [index, file] of files.entries()) {
      await rename(`${file}${suffix}`, file);
      replaced.push(index);
    }
  } catch (error) {
    // Preserve the source/preview pair if a disk failure interrupts the save.
    for (const index of replaced) {
      const rollback = previous[index];
      if (rollback === null) await unlink(files[index]).catch(() => {});
      else await writeFile(files[index], rollback);
    }
    throw error;
  } finally {
    await Promise.all(files.map(file => unlink(`${file}${suffix}`).catch(() => {})));
  }
}

/** Only the loopback Vite server can write the one public layout configuration. */
export function layoutEditorPlugin(): Plugin {
  const token = randomBytes(32).toString('hex');
  let projectRoot = '';
  let outputDirectory = '';
  let saveQueue = Promise.resolve();

  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const pathname = req.url?.split('?')[0] ?? '';
    if (!pathname.startsWith(apiRoot)) { next(); return; }
    const origin = localOrigin(req);
    if (!origin) { send(res, 404, { error: 'Not found.' }); return; }
    if (req.headers.origin && req.headers.origin !== origin) {
      send(res, 403, { error: 'Use the editor from this local website.' });
      return;
    }

    if (pathname === `${apiRoot}status` && req.method === 'GET') {
      send(res, 200, { enabled: true, token, version: 1 });
      return;
    }
    if (pathname !== `${apiRoot}layout`) { send(res, 404, { error: 'Not found.' }); return; }
    if (req.method !== 'PUT') {
      res.setHeader('Allow', 'PUT');
      send(res, 405, { error: 'Method not allowed.' });
      return;
    }
    if (req.headers.origin !== origin || !hasToken(req, token)) {
      send(res, 403, { error: 'Reopen the local editor before saving.' });
      return;
    }
    if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      send(res, 415, { error: 'Send a JSON layout.' });
      return;
    }
    if (Number(req.headers['content-length'] ?? 0) > maxBodyBytes) {
      send(res, 413, { error: 'Layout is too large.' });
      req.resume();
      return;
    }
    try {
      const payload = await readJson(req);
      const layout = parseLayoutDocument(payload && typeof payload === 'object' && 'layout' in payload ? payload.layout : null);
      if (!layout) { send(res, 400, { error: 'Invalid layout values.' }); return; }
      const write = saveQueue.then(() => persistLayout(projectRoot, outputDirectory, layout));
      saveQueue = write.catch(() => {});
      await write;
      send(res, 200, { ok: true, layout });
    } catch (error) {
      const status = (error as { status?: number }).status ?? 500;
      send(res, status, { error: status === 500 ? 'The layout could not be saved. Check file permissions and try again.' : (error as Error).message });
    }
  };

  return {
    name: 'portfolio-local-layout-editor',
    configResolved(config) {
      projectRoot = config.root;
      outputDirectory = join(config.root, config.build.outDir);
    },
    configureServer(server) { server.middlewares.use((req, res, next) => { void middleware(req, res, next); }); },
    configurePreviewServer(server) { server.middlewares.use((req, res, next) => { void middleware(req, res, next); }); },
  };
}
