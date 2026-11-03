import test from 'node:test';
import assert from 'node:assert/strict';
import { resizeBox, resizeHandles } from '../src/editor/resize.ts';

const canvas = { width: 1200, height: 700 };
const box = { x: 300, y: 200, width: 240, height: 160 };
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);

test('left and top edges keep the opposite edges fixed', () => {
  assert.deepEqual(resizeBox(box, canvas, 'nw', -40, -30, false), { x: 260, y: 170, width: 280, height: 190 });
  assert.deepEqual(resizeBox(box, canvas, 'w', 40, 99, false), { x: 340, y: 200, width: 200, height: 160 });
  assert.deepEqual(resizeBox(box, canvas, 'n', 99, 40, false), { x: 300, y: 240, width: 240, height: 120 });
});

test('all eight proportional handles preserve anchors and stay inside canvas at limits', () => {
  for (const handle of resizeHandles) for (const delta of [-5000, -30, 30, 5000]) {
    const result = resizeBox(box, canvas, handle, delta, delta, true);
    close(result.width / result.height, box.width / box.height);
    assert.ok(result.x >= -1e-8 && result.y >= -1e-8);
    assert.ok(result.x + result.width <= canvas.width + 1e-8 && result.y + result.height <= canvas.height + 1e-8);
    assert.ok(result.width >= 24 - 1e-8 && result.height >= 16 - 1e-8);
    if (handle.includes('w')) close(result.x + result.width, box.x + box.width);
    else if (handle.includes('e')) close(result.x, box.x);
    else close(result.x + result.width / 2, box.x + box.width / 2);
    if (handle.includes('n')) close(result.y + result.height, box.y + box.height);
    else if (handle.includes('s')) close(result.y, box.y);
    else close(result.y + result.height / 2, box.y + box.height / 2);
  }
});

test('unlocked handles cannot flip or cross the canvas boundary', () => {
  for (const handle of resizeHandles) for (const delta of [-5000, 5000]) {
    const result = resizeBox(box, canvas, handle, delta, delta, false);
    assert.ok(result.x >= 0 && result.y >= 0);
    assert.ok(result.width >= 24 && result.height >= 16);
    assert.ok(result.x + result.width <= canvas.width && result.y + result.height <= canvas.height);
  }
});
