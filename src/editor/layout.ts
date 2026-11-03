export const projectSlugs = ['emotional-vacuum', 'pcg-project', 'mixed-lives', 'dku-campus-tour'] as const;
export const itemKinds = ['cover', 'title', 'description'] as const;
export type ProjectSlug = typeof projectSlugs[number];
export type LayoutItemKind = typeof itemKinds[number];
export type LayoutItemId = `${ProjectSlug}.${LayoutItemKind}`;

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  lineHeight?: number;
}

export interface LayoutDocument {
  version: 1;
  canvas: { width: number; height: number };
  items: Partial<Record<LayoutItemId, LayoutBox>>;
}

export const layoutItemIds = projectSlugs.flatMap(slug => itemKinds.map(kind => `${slug}.${kind}` as LayoutItemId));
export const emptyLayout: LayoutDocument = { version: 1, canvas: { width: 1200, height: 700 }, items: {} };

// The reference composition matches the desktop gallery; all values are design pixels.
export const defaultLayout: LayoutDocument = {
  version: 1,
  canvas: { width: 1200, height: 700 },
  items: {
    'emotional-vacuum.cover': { x: 252.08, y: 64, width: 292.5, height: 214 },
    'emotional-vacuum.title': { x: 48, y: 82, width: 178, height: 58, fontSize: 23.76, lineHeight: 1.17 },
    'emotional-vacuum.description': { x: 48, y: 155, width: 178, height: 110, fontSize: 13, lineHeight: 1.65 },
    'pcg-project.cover': { x: 554.58, y: 0, width: 443.75, height: 278 },
    'pcg-project.title': { x: 1021.33, y: 52, width: 178, height: 58, fontSize: 23.76, lineHeight: 1.17 },
    'pcg-project.description': { x: 1021.33, y: 122, width: 178, height: 110, fontSize: 13, lineHeight: 1.65 },
    'mixed-lives.cover': { x: 201.67, y: 288, width: 342.92, height: 385.78 },
    'mixed-lives.title': { x: 26, y: 430, width: 150.6, height: 30, fontSize: 23.76, lineHeight: 1.17 },
    'mixed-lives.description': { x: 26, y: 472, width: 150.6, height: 110, fontSize: 13, lineHeight: 1.65 },
    'dku-campus-tour.cover': { x: 554.58, y: 288, width: 292.5, height: 214 },
    'dku-campus-tour.title': { x: 554.58, y: 516, width: 330, height: 28, fontSize: 22, lineHeight: 1.17 },
    'dku-campus-tour.description': { x: 554.58, y: 553, width: 330, height: 70, fontSize: 13, lineHeight: 1.65 },
  },
};

export function cloneLayout(layout: LayoutDocument): LayoutDocument {
  return JSON.parse(JSON.stringify(layout)) as LayoutDocument;
}

export function completeLayout(layout: LayoutDocument): LayoutDocument {
  return { version: 1, canvas: { ...layout.canvas }, items: { ...cloneLayout(defaultLayout).items, ...cloneLayout(layout).items } };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberIn(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

export function parseLayoutDocument(value: unknown): LayoutDocument | null {
  if (!record(value) || value.version !== 1 || !record(value.canvas) || !record(value.items)) return null;
  if (value.canvas.width !== 1200 || value.canvas.height !== 700) return null;
  if (Object.keys(value).some(key => !['version', 'canvas', 'items'].includes(key))) return null;
  if (Object.keys(value.canvas).some(key => !['width', 'height'].includes(key))) return null;
  const items: LayoutDocument['items'] = {};
  for (const [id, box] of Object.entries(value.items)) {
    if (!layoutItemIds.includes(id as LayoutItemId) || !record(box)) return null;
    if (Object.keys(box).some(key => !['x', 'y', 'width', 'height', 'fontSize', 'lineHeight'].includes(key))) return null;
    if (!numberIn(box.x, 0, value.canvas.width) || !numberIn(box.y, 0, value.canvas.height)) return null;
    if (!numberIn(box.width, 24, value.canvas.width) || !numberIn(box.height, 16, value.canvas.height)) return null;
    if (box.x + box.width > value.canvas.width + 1 || box.y + box.height > value.canvas.height + 1) return null;
    const kind = id.split('.')[1];
    if (kind !== 'cover' && (!numberIn(box.fontSize, 8, 100) || !numberIn(box.lineHeight, 0.8, 3))) return null;
    if (box.fontSize !== undefined && !numberIn(box.fontSize, 8, 100)) return null;
    if (box.lineHeight !== undefined && !numberIn(box.lineHeight, 0.8, 3)) return null;
    items[id as LayoutItemId] = { x: box.x, y: box.y, width: box.width, height: box.height,
      ...(box.fontSize !== undefined ? { fontSize: box.fontSize } : {}),
      ...(box.lineHeight !== undefined ? { lineHeight: box.lineHeight } : {}) };
  }
  return { version: 1, canvas: { width: value.canvas.width, height: value.canvas.height }, items };
}

export const layoutUrl = '/home-layout.json';

export async function loadLayout(signal?: AbortSignal): Promise<LayoutDocument> {
  const response = await fetch(layoutUrl, { cache: 'no-store', signal });
  if (!response.ok) throw new Error('无法读取排版文件。');
  const layout = parseLayoutDocument(await response.json());
  if (!layout) throw new Error('排版文件格式不正确。');
  return layout;
}

export function isLocalEditorHost(): boolean {
  return ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);
}
