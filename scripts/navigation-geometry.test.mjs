import test from 'node:test';
import assert from 'node:assert/strict';
import { contentFrame, desktopRenderLayout, navigationGeometry } from '../src/components/navigationGeometry.ts';
import { completeLayout, emptyLayout } from '../src/editor/layout.ts';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < .0001, `${actual} differs from ${expected}`);

test('desktop navigation aligns with the hero frame and keeps readable control sizes', () => {
  const nav = navigationGeometry(emptyLayout, 1425, 900, 1440);
  close(nav.left, 72.5);
  close(nav.cvLeft, 1230.5);
  close(nav.top, 31);
  close(nav.width, 122);
  close(nav.height, 44);
  assert.ok(nav.headerHeight > nav.top + nav.height);
  const shorter = navigationGeometry(emptyLayout, 1265, 720, 1280);
  close(shorter.left, 56);
  close(shorter.cvLeft, 1087);
  close(shorter.width, 122);
  close(shorter.top, 31);
});

test('homepage chrome and other page headers agree at short, wide and tall viewport shapes', () => {
  const source = completeLayout(emptyLayout);
  for (const [width, height, viewportWidth] of [[1265, 720, 1280], [1425, 900, 1440], [1905, 1080, 1920], [2545, 720, 2560], [1425, 1200, 1440]]) {
    const scale = Math.min(width / 1440, height / 900);
    const frame = { x: (width - 1440 * scale) / 2, y: (height - 900 * scale) / 2, scale };
    const display = desktopRenderLayout(source, width, height, viewportWidth, frame);
    const nav = navigationGeometry(source, width, height, viewportWidth);
    const content = contentFrame(width, viewportWidth);
    close(frame.x + display.items['page.name'].x * scale, nav.name.x);
    close(frame.y + display.items['page.name'].y * scale, nav.name.y);
    close(display.items['page.name'].fontSize * scale, nav.name.fontSize);
    close(frame.x + display.items['page.cv'].x * scale, nav.cvLeft);
    close(display.items['page.cv'].width * scale, nav.width);
    close(nav.cvLeft + nav.width, content.right);
    close(nav.name.x, content.left);
    for (const [id, box] of Object.entries(source.items)) if (!id.startsWith('page.')) assert.deepEqual(display.items[id], box);
  }
});

test('saved homepage button adjustments apply to project navigation without modifying the layout', () => {
  const layout = completeLayout(emptyLayout);
  layout.items['page.cv'] = { x: 1200, y: 28, width: 160, height: 54, fontSize: 15, lineHeight: 1.5 };
  const before = structuredClone(layout);
  const nav = navigationGeometry(layout, 1440, 900);
  assert.deepEqual([nav.cvLeft, nav.top, nav.width, nav.height, nav.fontSize], [1200, 28, 160, 54, 15]);
  assert.deepEqual(layout, before);
});

test('mobile controls retain touch size, equal gutters and room for a chapter menu', () => {
  for (const viewport of [320, 390, 768]) {
    const width = viewport - 15;
    const nav = navigationGeometry(emptyLayout, width, 844, viewport);
    close(width - nav.cvLeft - nav.width, nav.left);
    assert.equal(nav.height, 44);
    assert.ok(nav.cvLeft - nav.left - nav.width >= 44);
    assert.ok(nav.top + nav.height < nav.headerHeight);
  }
});
