import test from 'node:test';
import assert from 'node:assert/strict';
import { completeLayout, defaultLayout, emptyLayout, layoutItemIds, legacyPlacement, parseLayoutDocument } from '../src/editor/layout.ts';

test('legacy project coordinates migrate into the full page without resetting owner adjustments', () => {
  const original = { version: 1, canvas: { width: 1200, height: 700 }, items: {
    'emotional-vacuum.cover': { x: 271.94, y: 78.53, width: 272.64, height: 199.47 },
    'mixed-lives.title': { x: 72.59, y: 428.47, width: 150.6, height: 30, fontSize: 23.76, lineHeight: 1.17 },
  } };
  const before = structuredClone(original);
  const migrated = parseLayoutDocument(original);
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.canvas, { width: 1440, height: 900 });
  const expectedX = legacyPlacement.x + original.items['emotional-vacuum.cover'].x * legacyPlacement.scale;
  assert.ok(Math.abs(migrated.items['emotional-vacuum.cover'].x - expectedX) < .01);
  assert.equal(migrated.items['mixed-lives.title'].lineHeight, 1.17);
  assert.deepEqual(original, before);
  assert.equal(Object.keys(completeLayout(migrated).items).length, 16);
});

test('all full-page elements can be saved and read back including header and footer', () => {
  const layout = completeLayout(emptyLayout);
  layout.items['page.name'].x = 94;
  layout.items['page.cv'] = { x: 1190, y: 40, width: 160, height: 55, fontSize: 15, lineHeight: 1.4 };
  layout.items['page.contact'].y = 820;
  assert.deepEqual(parseLayoutDocument(JSON.parse(JSON.stringify(layout))), layout);
  assert.deepEqual(Object.keys(layout.items).sort(), [...layoutItemIds].sort());
});

test('unknown elements, out-of-bounds boxes, non-finite values and wrong canvases are rejected', () => {
  for (const mutate of [
    layout => { layout.items['page.other'] = layout.items['page.name']; },
    layout => { layout.items['page.contact'].x = 1430; },
    layout => { layout.items['page.name'].fontSize = Infinity; },
    layout => { layout.items['page.cv'].href = 'https://example.com'; },
    layout => { layout.canvas.width = 1600; },
  ]) {
    const layout = structuredClone(defaultLayout);
    mutate(layout);
    assert.equal(parseLayoutDocument(layout), null);
  }
  assert.equal(parseLayoutDocument({ version: 1, canvas: { width: 1200, height: 700 }, items: { 'page.name': defaultLayout.items['page.name'] } }), null);
});

test('reset remains a valid complete page and legacy minimum sizes stay editable after migration', () => {
  assert.deepEqual(parseLayoutDocument(emptyLayout), emptyLayout);
  const migrated = parseLayoutDocument({ version: 1, canvas: { width: 1200, height: 700 }, items: {
    'mixed-lives.title': { x: 0, y: 0, width: 24, height: 16, fontSize: 8, lineHeight: .8 },
  } });
  assert.ok(parseLayoutDocument(migrated));
});
