import { completeLayout } from '../editor/layout.ts';
import type { LayoutBox, LayoutDocument } from '../editor/layout';

/** Match the symmetric content gutters used by both project hero images. */
export function contentFrame(width: number, viewportWidth = width) {
  const gutter = viewportWidth <= 650 ? 20 : viewportWidth <= 1100 ? 32 : 56;
  const maximum = Math.min(1400, Math.max(1280, viewportWidth * .25 + 920));
  const contentWidth = Math.min(maximum, width - gutter * 2);
  const left = (width - contentWidth) / 2;
  return { left, right: width - left, width: contentWidth };
}

/** Saved chrome offsets are relative to the 1440px reference page's 80..1360 frame. */
export function navigationGeometry(layout: LayoutDocument, width: number, height: number, viewportWidth = width) {
  const document = completeLayout(layout);
  const frame = contentFrame(width, viewportWidth);
  const name = { ...document.items['page.name']!, x: frame.left + document.items['page.name']!.x - 80 };
  const subtitle = { ...document.items['page.subtitle']!, x: frame.left + document.items['page.subtitle']!.x - 80 };
  const contact = { ...document.items['page.contact']!, x: frame.right + document.items['page.contact']!.x - 1360,
    y: height - document.canvas.height + document.items['page.contact']!.y };
  if (viewportWidth <= 1100) {
    const buttonWidth = viewportWidth <= 650 ? 104 : 122;
    const top = viewportWidth <= 650 ? 24 : 31;
    return { left: frame.left, cvLeft: frame.right - buttonWidth, top, width: buttonWidth, height: 44,
      fontSize: viewportWidth <= 650 ? 12 : 13, lineHeight: 1.4, scale: 1, headerHeight: top + 64, name, subtitle, contact };
  }
  const button = document.items['page.cv']!;
  return { left: frame.left, cvLeft: frame.right + button.x - 1360, top: button.y,
    width: button.width, height: button.height, fontSize: button.fontSize!, lineHeight: button.lineHeight!, scale: 1,
    headerHeight: Math.max(84, Math.ceil(button.y + button.height + 24)), name, subtitle, contact };
}

/** Only chrome responds to the page frame; the owner's project composition stays intact. */
export function desktopRenderLayout(layout: LayoutDocument, width: number, height: number, viewportWidth: number,
  canvasFrame: { x: number; y: number; scale: number }) {
  const document = completeLayout(layout);
  const nav = navigationGeometry(layout, width, height, viewportWidth);
  const boxes: [keyof typeof document.items, LayoutBox][] = [
    ['page.name', nav.name], ['page.subtitle', nav.subtitle], ['page.contact', nav.contact],
    ['page.cv', { x: nav.cvLeft, y: nav.top, width: nav.width, height: nav.height, fontSize: nav.fontSize, lineHeight: nav.lineHeight }],
  ];
  for (const [id, box] of boxes) document.items[id] = { ...box,
    x: (box.x - canvasFrame.x) / canvasFrame.scale, y: (box.y - canvasFrame.y) / canvasFrame.scale,
    width: box.width / canvasFrame.scale, height: box.height / canvasFrame.scale,
    ...(box.fontSize !== undefined ? { fontSize: box.fontSize / canvasFrame.scale } : {}),
  };
  return document;
}
