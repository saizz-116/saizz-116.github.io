export const projectSlugs = ['emotional-vacuum', 'pcg-project', 'mixed-lives', 'dku-campus-tour'] as const;
export const itemKinds = ['cover', 'title', 'description'] as const;
export const pageItemKinds = ['name', 'subtitle', 'cv', 'contact'] as const;
export type ProjectSlug = typeof projectSlugs[number];
export type ProjectItemKind = typeof itemKinds[number];
export type PageItemKind = typeof pageItemKinds[number];
export type LayoutItemKind = ProjectItemKind | PageItemKind;
export type LayoutGroup = ProjectSlug | 'page';
export type ProjectItemId = `${ProjectSlug}.${ProjectItemKind}`;
export type LayoutItemId = ProjectItemId | `page.${PageItemKind}`;

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  lineHeight?: number;
}

export interface LayoutDocument {
  version: 2;
  canvas: { width: number; height: number };
  items: Partial<Record<LayoutItemId, LayoutBox>>;
}

const projectItemIds = projectSlugs.flatMap(slug => itemKinds.map(kind => `${slug}.${kind}` as ProjectItemId));
export const layoutItemIds: LayoutItemId[] = [...pageItemKinds.map(kind => `page.${kind}` as LayoutItemId), ...projectItemIds];
export const emptyLayout: LayoutDocument = { version: 2, canvas: { width: 1440, height: 900 }, items: {} };
export const isFrameItem = (id: LayoutItemId) => id.endsWith('.cover') || id === 'page.cv';

// Keep the old project-only defaults for non-destructive migration of saved layouts.
const legacyDefaults: Record<ProjectItemId, LayoutBox> = {
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
};

const round = (value: number) => Math.round(value * 100) / 100;
export const legacyPlacement = { x: 170, y: 124, scale: 69 / 70 };

function migrateProjectItems(items: Partial<Record<LayoutItemId, LayoutBox>>): LayoutDocument['items'] {
  return Object.fromEntries(Object.entries(items).map(([id, box]) => [id, {
    x: round(legacyPlacement.x + box.x * legacyPlacement.scale),
    y: round(legacyPlacement.y + box.y * legacyPlacement.scale),
    width: round(Math.max(24, box.width * legacyPlacement.scale)),
    height: round(Math.max(16, box.height * legacyPlacement.scale)),
    ...(box.fontSize !== undefined ? { fontSize: round(Math.max(8, box.fontSize * legacyPlacement.scale)) } : {}),
    ...(box.lineHeight !== undefined ? { lineHeight: box.lineHeight } : {}),
  }]));
}

export const defaultLayout: LayoutDocument = {
  ...emptyLayout,
  items: {
    ...migrateProjectItems(legacyDefaults),
    'page.name': { x: 80, y: 27, width: 310, height: 46, fontSize: 42.75, lineHeight: 1.05 },
    'page.subtitle': { x: 80, y: 79, width: 120, height: 17, fontSize: 12, lineHeight: 1.4 },
    'page.cv': { x: 1238, y: 31, width: 122, height: 44, fontSize: 13, lineHeight: 1.4 },
    'page.contact': { x: 1102, y: 840, width: 258, height: 36, fontSize: 13, lineHeight: 1.4 },
  },
};

export function cloneLayout(layout: LayoutDocument): LayoutDocument {
  return JSON.parse(JSON.stringify(layout)) as LayoutDocument;
}

export function completeLayout(layout: LayoutDocument): LayoutDocument {
  return { version: 2, canvas: { ...layout.canvas }, items: { ...cloneLayout(defaultLayout).items, ...cloneLayout(layout).items } };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberIn(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

export function parseLayoutDocument(value: unknown): LayoutDocument | null {
  if (!record(value) || (value.version !== 1 && value.version !== 2) || !record(value.canvas) || !record(value.items)) return null;
  const legacy = value.version === 1;
  const canvasWidth = legacy ? 1200 : 1440;
  const canvasHeight = legacy ? 700 : 900;
  if (value.canvas.width !== canvasWidth || value.canvas.height !== canvasHeight) return null;
  if (Object.keys(value).some(key => !['version', 'canvas', 'items'].includes(key))) return null;
  if (Object.keys(value.canvas).some(key => !['width', 'height'].includes(key))) return null;
  const items: LayoutDocument['items'] = {};
  for (const [id, box] of Object.entries(value.items)) {
    if (!(legacy ? projectItemIds : layoutItemIds).includes(id as ProjectItemId) || !record(box)) return null;
    if (Object.keys(box).some(key => !['x', 'y', 'width', 'height', 'fontSize', 'lineHeight'].includes(key))) return null;
    if (!numberIn(box.x, 0, canvasWidth) || !numberIn(box.y, 0, canvasHeight)) return null;
    if (!numberIn(box.width, 24, canvasWidth) || !numberIn(box.height, 16, canvasHeight)) return null;
    if (box.x + box.width > canvasWidth + 1 || box.y + box.height > canvasHeight + 1) return null;
    const kind = id.split('.')[1];
    if (kind !== 'cover' && (!numberIn(box.fontSize, 8, 100) || !numberIn(box.lineHeight, 0.8, 3))) return null;
    if (box.fontSize !== undefined && !numberIn(box.fontSize, 8, 100)) return null;
    if (box.lineHeight !== undefined && !numberIn(box.lineHeight, 0.8, 3)) return null;
    items[id as LayoutItemId] = { x: box.x, y: box.y, width: box.width, height: box.height,
      ...(box.fontSize !== undefined ? { fontSize: box.fontSize } : {}),
      ...(box.lineHeight !== undefined ? { lineHeight: box.lineHeight } : {}) };
  }
  return legacy
    ? { version: 2, canvas: { ...emptyLayout.canvas }, items: migrateProjectItems({ ...legacyDefaults, ...items }) }
    : { version: 2, canvas: { width: canvasWidth, height: canvasHeight }, items };
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
