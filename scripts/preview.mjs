import { spawn, spawnSync } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const previewUrl = 'http://127.0.0.1:4173';
const vite = join(projectRoot, 'node_modules/vite/bin/vite.js');
const typescript = join(projectRoot, 'node_modules/typescript/bin/tsc');
const stateDirectory = join(projectRoot, '.preview');

function build(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: projectRoot,
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, PATH: `${dirname(process.execPath)};${process.env.PATH || ''}` },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('The build failed. Review the message above before restarting the preview.');
}

async function readPreview() {
  try {
    const response = await fetch(`${previewUrl}/about`, {
      signal: AbortSignal.timeout(1200),
      cache: 'no-store',
    });
    return { ok: response.ok, html: await response.text() };
  } catch {
    return null;
  }
}

async function hasLayoutEditor() {
  try {
    const response = await fetch(`${previewUrl}/__portfolio-editor/status`, {
      signal: AbortSignal.timeout(1200), cache: 'no-store',
    });
    if (!response.ok) return false;
    const status = await response.json();
    return status.enabled === true && status.version === 1;
  } catch { return false; }
}

async function restartManagedPreview() {
  // A stale preview must be restarted to load newly added Vite middleware.
  // Never stop a process based only on a port or an old PID file.
  const pidFile = join(stateDirectory, 'server.pid');
  if (!existsSync(pidFile) || process.platform !== 'win32') return false;
  const recordedPid = readFileSync(pidFile, 'utf8').trim();
  if (!/^[1-9]\d{0,9}$/.test(recordedPid)) return false;
  const pid = Number(recordedPid);
  if (!Number.isSafeInteger(pid) || pid > 2147483647 || pid === process.pid) return false;
  const powershell = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const inspect = spawnSync(powershell, ['-NoProfile', '-NonInteractive', '-Command',
    `$portfolioProcess = Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}'; if ($null -ne $portfolioProcess) { [pscustomobject]@{ CommandLine = $portfolioProcess.CommandLine; ExecutablePath = $portfolioProcess.ExecutablePath; Listens = [bool](Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | Where-Object OwningProcess -EQ ${pid}) } | ConvertTo-Json -Compress }`,
  ], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (inspect.error || inspect.status !== 0 || !inspect.stdout.trim()) return false;
  let details;
  try { details = JSON.parse(inspect.stdout); } catch { return false; }
  const args = [...String(details.CommandLine ?? '').matchAll(/"([^"\r\n]*)"|([^\s"]+)/g)].map(match => match[1] ?? match[2]);
  const samePath = (left, right) => typeof left === 'string' && normalize(left).toLowerCase() === normalize(right).toLowerCase();
  const expectedArgs = ['preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'];
  if (!details.Listens || !samePath(details.ExecutablePath, process.execPath)
    || !samePath(args[0], process.execPath) || !samePath(args[1], vite)
    || args.length !== expectedArgs.length + 2 || !expectedArgs.every((value, index) => args[index + 2] === value)) return false;
  console.log('Restarting the managed preview to enable the local layout editor...');
  try { process.kill(pid); } catch { return false; }
  for (let attempt = 0; attempt < 24; attempt += 1) {
    if (!(await readPreview())) return true;
    await delay(100);
  }
  return false;
}

async function start() {
  if (!existsSync(vite) || !existsSync(typescript)) {
    throw new Error('Dependencies are missing. Install them using the instructions in README.md, then run this launcher again.');
  }

  console.log('Building the latest portfolio files...');
  build(typescript, ['-b']);
  build(vite, ['build']);

  const expectedHtml = readFileSync(join(projectRoot, 'dist/index.html'), 'utf8').trim();
  const matchesPortfolio = response => response?.ok && response.html.trim() === expectedHtml;
  const existing = await readPreview();
  if (matchesPortfolio(existing) && await hasLayoutEditor()) {
    console.log(`\nPortfolio is already running: ${previewUrl}/`);
    return;
  }
  if (existing && !(matchesPortfolio(existing) && await restartManagedPreview())) {
    throw new Error('The process on port 4173 could not be safely reused or restarted. Close the old portfolio preview (or the application using this port), then run this launcher again.');
  }

  mkdirSync(stateDirectory, { recursive: true });
  const logFile = join(stateDirectory, 'server.log');
  const log = openSync(logFile, 'a');
  let child;
  try {
    child = spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
      cwd: projectRoot,
      detached: true,
      windowsHide: true,
      stdio: ['ignore', log, log],
    });
    // Register before yielding so a failed process launch cannot be unhandled.
    child.on('error', error => console.error(`Preview process: ${error.message}`));
    child.unref();
  } finally {
    closeSync(log);
  }

  for (let attempt = 0; attempt < 24; attempt += 1) {
    await delay(250);
    if (matchesPortfolio(await readPreview()) && await hasLayoutEditor()) {
      writeFileSync(join(stateDirectory, 'server.pid'), String(child.pid));
      console.log(`\nPortfolio is ready: ${previewUrl}/`);
      console.log('The local server runs in the background. Run this launcher again after restarting Windows.');
      return;
    }
    if (child.exitCode !== null) break;
  }
  throw new Error(`The preview did not start. See ${logFile} for details.`);
}

try {
  await start();
} catch (error) {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
}
