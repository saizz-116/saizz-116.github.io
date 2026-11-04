import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProjectPage, parseProjectLayouts, projectLayoutCSS } from '../src/editor/project-layout.ts';

test('independent project changes preserve other pages and allow an empty-page reset', () => {
  const document = parseProjectLayouts({ version: 1, pages: {
    'pcg-project': { 'e-house-0': { x: -25, y: 12, width: 470 } },
    'emotional-vacuum': { 'e-title-0': { fontSize: 70, lineHeight: 1.1 } },
    'mixed-lives': {},
  } });
  assert.ok(document);
  assert.equal(document.pages['pcg-project']['e-house-0'].width, 470);
  assert.equal(document.pages['emotional-vacuum']['e-title-0'].fontSize, 70);
  assert.deepEqual(document.pages['mixed-lives'], {});
});

test('project save values cannot inject styles, paths, unknown properties or nonfinite values', () => {
  for (const page of [
    { '../home-layout': { x: 1 } }, { 'e-house-0': { background: 'url(https://example.com)' } },
    { 'e-house-0': { x: Infinity } }, { 'e-house-0': { width: -1 } },
    { 'e-house-0': { fontSize: 900 } }, { 'e-house-0': { constructor: 2 } },
    JSON.parse('{"__proto__":{"x":1}}'),
  ]) assert.equal(parseProjectPage(page), null);
  assert.equal(parseProjectLayouts({ version: 1, pages: { '../other': {} } }), null);
});

test('saved layout affects desktop only and produces no overrides when reset', () => {
  const css = projectLayoutCSS({ 'e-house-0': { x: -20, width: 400 }, 'e-title-0': { fontSize: 48 } });
  assert.ok(css.startsWith('@media (min-width:1101px)'));
  assert.ok(css.includes('translate:-20px 0px!important'));
  assert.ok(css.includes('font-size:48px!important'));
  assert.equal(projectLayoutCSS({}), '@media (min-width:1101px){}');
});
