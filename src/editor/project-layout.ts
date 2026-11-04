export const projectSlugs = ['emotional-vacuum', 'dku-campus-tour', 'pcg-project', 'mixed-lives'] as const;
export type ProjectSlug = typeof projectSlugs[number];
export const projectStyleLimits = {
  x: [-2000, 2000], y: [-4000, 4000], width: [24, 2400], fontSize: [8, 160],
  lineHeight: [.8, 3], gap: [0, 200], marginBottom: [-100, 500],
} as const;
export type ProjectStyle = Partial<Record<keyof typeof projectStyleLimits, number>>;
export type ProjectPageLayout = Record<string, ProjectStyle>;
export interface ProjectLayouts { version: 1; pages: Partial<Record<ProjectSlug, ProjectPageLayout>> }
export const emptyProjectLayouts: ProjectLayouts = { version: 1, pages: {} };
export const isProjectSlug = (value: string): value is ProjectSlug => projectSlugs.includes(value as ProjectSlug);

export function parseProjectPage(value: unknown): ProjectPageLayout | null {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length > 512) return null;
  const result: ProjectPageLayout = {};
  for (const [id, patch] of Object.entries(value)) {
    if (!/^[a-z][a-z0-9._-]{0,130}$/.test(id) || ['constructor', 'prototype', '__proto__'].includes(id)
      || !patch || typeof patch !== 'object' || Array.isArray(patch)) return null;
    const style: ProjectStyle = {};
    for (const [key, number] of Object.entries(patch)) {
      if (!Object.hasOwn(projectStyleLimits, key) || typeof number !== 'number' || !Number.isFinite(number)) return null;
      const range = projectStyleLimits[key as keyof ProjectStyle];
      if (!range || number < range[0] || number > range[1]) return null;
      style[key as keyof ProjectStyle] = Math.round(number * 100) / 100;
    }
    result[id] = style;
  }
  return result;
}

export function parseProjectLayouts(value: unknown): ProjectLayouts | null {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('pages' in value)
    || !value.pages || typeof value.pages !== 'object' || Array.isArray(value.pages)) return null;
  const pages: ProjectLayouts['pages'] = {};
  for (const [slug, page] of Object.entries(value.pages)) {
    if (!isProjectSlug(slug)) return null;
    const parsed = parseProjectPage(page);
    if (!parsed) return null;
    pages[slug] = parsed;
  }
  return { version: 1, pages };
}

export function projectLayoutCSS(page: ProjectPageLayout): string {
  return '@media (min-width:1101px){' + Object.entries(page).map(([id, style]) => {
    const rules: string[] = [];
    if (style.x !== undefined || style.y !== undefined) rules.push(`translate:${style.x ?? 0}px ${style.y ?? 0}px!important`);
    if (style.width !== undefined) rules.push(`width:${style.width}px!important;max-width:none!important;flex-shrink:0!important`);
    if (style.fontSize !== undefined) rules.push(`font-size:${style.fontSize}px!important`);
    if (style.lineHeight !== undefined) rules.push(`line-height:${style.lineHeight}!important`);
    if (style.gap !== undefined) rules.push(`gap:${style.gap}px!important`);
    if (style.marginBottom !== undefined) rules.push(`margin-bottom:${style.marginBottom}px!important`);
    return `[data-project-layout-id="${id}"]{${rules.join(';')}}`;
  }).join('') + '}';
}

export interface ProjectElement { id: string; label: string; element: HTMLElement; kind: 'text' | 'media' | 'block' }
const hash = (text: string) => {
  let result = 2166136261;
  for (let index = 0; index < text.length; index++) result = Math.imul(result ^ text.charCodeAt(index), 16777619);
  return (result >>> 0).toString(36);
};

/** Semantic keys stay stable across screen sizes and ordinary layout changes. */
export function registerProjectElements(): ProjectElement[] {
  const root = document.querySelector('main#main');
  if (!root) return [];
  const selectors = 'section,header,h1,h2,h3,p,figcaption,dt,dd,figure,dl,ol,ul,video,.pcg-house,.pcg-house-composition,.pcg-description,.ev-hero-copy,.dku-hero-copy,.ev-prose,.dku-section-heading,.project-navigation,.ev-film,.ev-film-heading,.dku-tower-pair';
  const occurrences = new Map<string, number>();
  const elements = [...root.querySelectorAll<HTMLElement>(selectors)].filter(element => !element.closest('dialog')
    && !element.matches('.ev-masthead,.dku-masthead') && !element.closest('.ev-masthead,.dku-masthead'));
  return elements.map(element => {
    const kind = element.matches('h1,h2,h3,p,figcaption,dt,dd') ? 'text' : element.matches('figure,video,.pcg-house,.ev-film') ? 'media' : 'block';
    const text = (element.getAttribute('aria-label') || element.querySelector('h1,h2,h3')?.textContent
      || element.querySelector('img')?.alt || element.querySelector('svg[aria-label]')?.getAttribute('aria-label') || element.textContent || '').replace(/\s+/g, ' ').trim();
    const scope = element.parentElement?.closest('[id]')?.id ?? 'main';
    const signature = [scope, element.tagName, element.id, element.className, text.slice(0, 110)].join('|');
    const base = `e-${hash(signature)}`;
    const occurrence = occurrences.get(base) ?? 0;
    occurrences.set(base, occurrence + 1);
    const id = `${base}-${occurrence}`;
    element.dataset.projectLayoutId = id;
    return { id, kind, element, label: `${kind === 'text' ? '文字' : kind === 'media' ? '图像/视频' : '区块'} · ${text.slice(0, 48) || element.className || element.tagName}` };
  });
}
