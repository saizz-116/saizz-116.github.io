import type { LayoutBox, LayoutDocument } from './layout';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
export const resizeHandles: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
export const resizeHandleNames: Record<ResizeHandle, string> = {
  nw: '左上角', n: '上边', ne: '右上角', e: '右边', se: '右下角', s: '下边', sw: '左下角', w: '左边',
};
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Resizes from the grabbed side, keeping the opposite side/corner anchored. */
export function resizeBox(box: LayoutBox, canvas: LayoutDocument['canvas'], handle: ResizeHandle,
  dx: number, dy: number, lockAspect: boolean): LayoutBox {
  const sx = handle.includes('w') ? -1 : handle.includes('e') ? 1 : 0;
  const sy = handle.includes('n') ? -1 : handle.includes('s') ? 1 : 0;
  if (lockAspect) {
    const anchorX = box.x + box.width * (sx < 0 ? 1 : sx === 0 ? 0.5 : 0);
    const anchorY = box.y + box.height * (sy < 0 ? 1 : sy === 0 ? 0.5 : 0);
    const maxWidth = sx < 0 ? anchorX : sx > 0 ? canvas.width - anchorX : 2 * Math.min(anchorX, canvas.width - anchorX);
    const maxHeight = sy < 0 ? anchorY : sy > 0 ? canvas.height - anchorY : 2 * Math.min(anchorY, canvas.height - anchorY);
    const horizontal = sx * dx / box.width;
    const vertical = sy * dy / box.height;
    const delta = sx === 0 ? vertical : sy === 0 ? horizontal
      : Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical;
    const factor = clamp(1 + delta, Math.max(24 / box.width, 16 / box.height), Math.min(maxWidth / box.width, maxHeight / box.height));
    const width = box.width * factor;
    const height = box.height * factor;
    return { ...box, x: anchorX - width * (sx < 0 ? 1 : sx === 0 ? 0.5 : 0),
      y: anchorY - height * (sy < 0 ? 1 : sy === 0 ? 0.5 : 0), width, height };
  }
  const left = sx < 0 ? clamp(box.x + dx, 0, box.x + box.width - 24) : box.x;
  const right = sx > 0 ? clamp(box.x + box.width + dx, box.x + 24, canvas.width) : box.x + box.width;
  const top = sy < 0 ? clamp(box.y + dy, 0, box.y + box.height - 16) : box.y;
  const bottom = sy > 0 ? clamp(box.y + box.height + dy, box.y + 16, canvas.height) : box.y + box.height;
  return { ...box, x: left, y: top, width: right - left, height: bottom - top };
}
