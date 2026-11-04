import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { projects } from '../data/portfolio';
import { parseProjectPage, projectStyleLimits, registerProjectElements } from './project-layout';
import type { ProjectElement, ProjectPageLayout, ProjectSlug, ProjectStyle } from './project-layout';
import { resizeHandles, resizeHandleNames } from './resize';
import type { ResizeHandle } from './resize';
import './project-editor.css';

const copy = (page: ProjectPageLayout) => structuredClone(page);
const same = (a: ProjectPageLayout, b: ProjectPageLayout) => JSON.stringify(a) === JSON.stringify(b);
const clamp = (value: number, key: keyof ProjectStyle) => Math.max(projectStyleLimits[key][0], Math.min(projectStyleLimits[key][1], Math.round(value * 100) / 100));
type Drag = { pointer: number; mode: 'move' | ResizeHandle; id: string; clientX: number; clientY: number; before: ProjectPageLayout; rect: DOMRect; style: ProjectStyle };

function Field({ label, value, field, onChange }: { label: string; value: number; field: keyof ProjectStyle; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(Math.round(value * 100) / 100));
  const cancelled = useRef(false);
  useEffect(() => setDraft(String(Math.round(value * 100) / 100)), [value]);
  return <label><span>{label}</span><input type="number" aria-label={label} value={draft} min={projectStyleLimits[field][0]} max={projectStyleLimits[field][1]} step={field === 'lineHeight' ? .05 : 1}
    onChange={event => setDraft(event.target.value)} onBlur={() => { if (cancelled.current) { cancelled.current = false; setDraft(String(value)); return; } if (draft.trim() && Number.isFinite(Number(draft))) onChange(clamp(Number(draft), field)); else setDraft(String(value)); }}
    onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') { cancelled.current = true; event.currentTarget.blur(); } }} /></label>;
}

export default function ProjectLayoutEditor({ slug, initial, loadError, onPreview }: {
  slug: ProjectSlug; initial: ProjectPageLayout; loadError: string; onPreview: (page: ProjectPageLayout) => void;
}) {
  const [page, setPage] = useState(copy(initial));
  const pageRef = useRef(page);
  const [saved, setSaved] = useState(copy(initial));
  const [past, setPast] = useState<ProjectPageLayout[]>([]);
  const [future, setFuture] = useState<ProjectPageLayout[]>([]);
  const [elements, setElements] = useState<ProjectElement[]>([]);
  const [selected, setSelected] = useState('');
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [folded, setFolded] = useState(false);
  const [panelLeft, setPanelLeft] = useState(false);
  const [filter, setFilter] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState(loadError);
  const [saving, setSaving] = useState(false);
  const [desktop, setDesktop] = useState(window.innerWidth > 1100);
  const drag = useRef<Drag | null>(null);
  const leaving = useRef(false);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const dirty = !same(page, saved);
  const item = elements.find(entry => entry.id === selected);
  const style = page[selected] ?? {};
  const computed = item ? getComputedStyle(item.element) : null;

  const apply = useCallback((next: ProjectPageLayout) => { pageRef.current = next; setPage(next); onPreview(next); }, [onPreview]);
  const remember = useCallback((before: ProjectPageLayout) => { setPast(list => [...list.slice(-59), copy(before)]); setFuture([]); }, []);
  const change = useCallback((id: string, patch: ProjectStyle | null) => {
    const next = copy(pageRef.current);
    if (patch === null) delete next[id]; else next[id] = { ...next[id], ...patch };
    if (!same(next, pageRef.current)) { remember(pageRef.current); apply(next); }
  }, [apply, remember]);
  const undo = useCallback(() => { if (!past.length || saving || drag.current) return; setFuture(list => [copy(pageRef.current), ...list]); setPast(list => list.slice(0, -1)); apply(copy(past[past.length - 1])); }, [past, saving, apply]);
  const redo = useCallback(() => { if (!future.length || saving || drag.current) return; setPast(list => [...list, copy(pageRef.current)]); setFuture(list => list.slice(1)); apply(copy(future[0])); }, [future, saving, apply]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/__portfolio-editor/status', { cache: 'no-store', signal: controller.signal }).then(response => response.json()).then(status => {
      if (status.version !== 3 || !status.enabled || typeof status.token !== 'string') throw new Error('请重新运行 Start Portfolio.cmd，更新本机编辑服务。');
      setToken(status.token);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    document.documentElement.classList.add('project-layout-editing');
    const entries = registerProjectElements();
    setElements(entries);
    setSelected(entries.find(entry => entry.kind === 'text')?.id ?? entries[0]?.id ?? '');
    const resize = () => setDesktop(window.innerWidth > 1100);
    window.addEventListener('resize', resize);
    return () => { document.documentElement.classList.remove('project-layout-editing'); window.removeEventListener('resize', resize); };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { if (!leaving.current) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useLayoutEffect(() => {
    if (!item) { setRect(null); return; }
    const measure = () => {
      const next = item.element.getBoundingClientRect();
      const resizing = drag.current;
      // Width changes can move an absolutely right/bottom-anchored image by themselves.
      // Compensate from the rendered box so every handle keeps its opposite edge fixed.
      if (resizing && resizing.id === item.id && resizing.mode !== 'move') {
        const handle = resizing.mode;
        const targetLeft = handle.includes('w') ? resizing.rect.right - next.width
          : handle.includes('e') ? resizing.rect.left : resizing.rect.left + (resizing.rect.width - next.width) / 2;
        const targetTop = handle.includes('n') ? resizing.rect.bottom - next.height : resizing.rect.top;
        const dx = targetLeft - next.left, dy = targetTop - next.top;
        const current = pageRef.current[item.id] ?? {};
        if (Math.abs(dx) > .3 || Math.abs(dy) > .3) {
          const corrected = { ...current, x: clamp((current.x ?? 0) + dx, 'x'), y: clamp((current.y ?? 0) + dy, 'y') };
          if (corrected.x !== current.x || corrected.y !== current.y) apply({ ...pageRef.current, [item.id]: corrected });
        }
      }
      setRect(previous => previous && ['x', 'y', 'width', 'height'].every(key => previous[key as 'x'] === next[key as 'x']) ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(item.element);
    window.addEventListener('scroll', measure, true); window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('scroll', measure, true); window.removeEventListener('resize', measure); };
  }, [item, page, apply]);

  const begin = useCallback((element: HTMLElement, event: PointerEvent | React.PointerEvent, mode: Drag['mode']) => {
    if (saving || !desktop || event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    const id = element.dataset.projectLayoutId!;
    setSelected(id);
    element.tabIndex = -1;
    element.focus({ preventScroll: true });
    drag.current = { pointer: event.pointerId, mode, id, clientX: event.clientX, clientY: event.clientY, before: copy(pageRef.current), rect: element.getBoundingClientRect(), style: { ...pageRef.current[id] } };
    if (event.currentTarget instanceof HTMLElement) event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [saving, desktop]);

  useEffect(() => {
    const choose = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || event.target.closest('[data-project-editor]') || !desktop || saving) return;
      const element = event.target.closest<HTMLElement>('[data-project-layout-id]');
      if (element) { begin(element, event, 'move'); event.stopImmediatePropagation(); }
    };
    const block = (event: MouseEvent) => { if (desktop && event.target instanceof Element && !event.target.closest('[data-project-editor]')) { event.preventDefault(); event.stopImmediatePropagation(); } };
    const move = (event: PointerEvent) => {
      const current = drag.current;
      if (!current || event.pointerId !== current.pointer) return;
      event.preventDefault();
      const dx = event.clientX - current.clientX, dy = event.clientY - current.clientY;
      const patch: ProjectStyle = { ...current.style };
      if (current.mode === 'move') { patch.x = clamp((current.style.x ?? 0) + dx, 'x'); patch.y = clamp((current.style.y ?? 0) + dy, 'y'); }
      else {
        const west = current.mode.includes('w'), north = current.mode.includes('n');
        const horizontal = current.mode.includes('w') || current.mode.includes('e');
        const ratio = horizontal ? (west ? -dx : dx) / current.rect.width : (north ? -dy : dy) / current.rect.height;
        const width = clamp(current.rect.width * (1 + ratio), 'width');
        patch.width = width;
        if (west) patch.x = clamp((current.style.x ?? 0) + current.rect.width - width, 'x');
        if (north) patch.y = clamp((current.style.y ?? 0) + current.rect.height * (1 - width / current.rect.width), 'y');
      }
      apply({ ...current.before, [current.id]: patch });
    };
    const finish = (event: PointerEvent) => { const current = drag.current; if (!current || current.pointer !== event.pointerId) return; drag.current = null; if (!same(current.before, pageRef.current)) remember(current.before); };
    const cancel = (event: PointerEvent) => { const current = drag.current; if (current?.pointer === event.pointerId) { drag.current = null; apply(current.before); } };
    const interrupt = () => { const current = drag.current; if (current) { drag.current = null; apply(current.before); } };
    document.addEventListener('pointerdown', choose, true); document.addEventListener('click', block, true);
    window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', interrupt);
    return () => { document.removeEventListener('pointerdown', choose, true); document.removeEventListener('click', block, true); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', cancel); window.removeEventListener('blur', interrupt); };
  }, [begin, desktop, saving, apply, remember]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (!desktop || event.target instanceof HTMLElement && event.target.closest('input,select,textarea,button')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
      const delta: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (delta[event.key] && selectedRef.current && !saving) { event.preventDefault(); const id = selectedRef.current, previous = pageRef.current[id] ?? {}; const amount = event.shiftKey ? 10 : 1; change(id, { x: clamp((previous.x ?? 0) + delta[event.key][0] * amount, 'x'), y: clamp((previous.y ?? 0) + delta[event.key][1] * amount, 'y') }); }
    };
    window.addEventListener('keydown', keys); return () => window.removeEventListener('keydown', keys);
  }, [desktop, saving, change, undo, redo]);

  const leave = (url: string) => { if (!dirty || window.confirm('还有未保存的排版调整，确定离开吗？')) { leaving.current = true; window.location.href = url; } };
  const save = async () => {
    if (!token || saving || loadError) return;
    const valid = parseProjectPage(pageRef.current);
    if (!valid) { setError('有数值超出范围，请调整后保存。'); return; }
    setSaving(true); setError('');
    try {
      const response = await fetch('/__portfolio-editor/project-layout', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-portfolio-editor-token': token }, body: JSON.stringify({ project: slug, layout: valid }) });
      const result = await response.json();
      const stored = parseProjectPage(result.layout);
      if (!response.ok || result.ok !== true || !stored) throw new Error('保存失败，请检查本机编辑服务。');
      apply(stored); setSaved(copy(stored));
    } catch (reason) { setError(reason instanceof Error ? reason.message : '保存失败，请重试。'); }
    finally { setSaving(false); }
  };
  const selectElement = (id: string) => { setSelected(id); const entry = elements.find(element => element.id === id); if (entry) { entry.element.scrollIntoView({ block: 'center', behavior: 'instant' }); entry.element.tabIndex = -1; entry.element.focus({ preventScroll: true }); } };
  const pixels = (property: string, fallback: number) => { const number = Number.parseFloat(computed?.getPropertyValue(property) ?? ''); return Number.isFinite(number) ? number : fallback; };
  return <div data-project-editor="true" className="project-editor-ui">
    <div className="pe-toolbar">
      <strong>项目排版</strong>
      <select aria-label="选择项目页面" value={slug} onChange={event => leave(`/work/${event.target.value}?edit=layout`)}>{projects.map(project => <option key={project.slug} value={project.slug}>{project.title}</option>)}</select>
      <button onClick={undo} disabled={!past.length || saving}>撤销</button><button onClick={redo} disabled={!future.length || saving}>重做</button>
      <button onClick={() => { if (!same(pageRef.current, {})) { remember(pageRef.current); apply({}); } }} disabled={saving}>恢复本页</button>
      <span role="status" aria-live="polite" className={error ? 'pe-error' : ''}>{error || (saving ? '正在保存…' : dirty ? '未保存' : '已保存')}</span>
      <button className="pe-save" onClick={save} disabled={!dirty || !token || saving || !!loadError}>保存</button>
      <button onClick={() => setFolded(value => !value)}>{folded ? '展开设置' : '收起设置'}</button>
      <button onClick={() => leave(`/work/${slug}`)}>完成</button>
    </div>
    {!desktop && <div className="pe-phone-note">手机排版保持自动适配。请在电脑宽屏中调整桌面布局。</div>}
    {!folded && desktop && <aside className={`pe-inspector${panelLeft ? ' pe-inspector--left' : ''}`} aria-label="项目元素设置">
      <div className="pe-panel-heading"><strong>元素设置</strong><button onClick={() => setPanelLeft(value => !value)}>{panelLeft ? '移至右侧' : '移至左侧'}</button></div>
      <p>点击、拖动页面元素；四边与四角可缩放。方向键微调，Shift 加速。</p>
      <label className="pe-filter">查找元素<input aria-label="查找元素" value={filter} onChange={event => setFilter(event.target.value)} placeholder="标题、文字或图片说明" /></label>
      <label>选择元素<select aria-label="选择项目元素" value={selected} onChange={event => selectElement(event.target.value)}>
        {elements.filter(entry => entry.id === selected || entry.label.toLowerCase().includes(filter.toLowerCase())).map(entry => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
      </select></label>
      {item && <fieldset disabled={saving}>
        <p className="pe-current">{item.label}</p>
        <button onClick={() => { const parent = item.element.parentElement?.closest<HTMLElement>('[data-project-layout-id]'); if (parent) selectElement(parent.dataset.projectLayoutId!); }}>选择外层区块</button>
        <div className="pe-fields">
          <Field label="水平偏移" field="x" value={style.x ?? 0} onChange={x => change(selected, { x })} />
          <Field label="垂直偏移" field="y" value={style.y ?? 0} onChange={y => change(selected, { y })} />
          <Field label="宽度" field="width" value={style.width ?? rect?.width ?? 100} onChange={width => change(selected, { width })} />
          <Field label="下方间距" field="marginBottom" value={style.marginBottom ?? pixels('margin-bottom', 0)} onChange={marginBottom => change(selected, { marginBottom })} />
          {item.kind === 'text' && <><Field label="字号" field="fontSize" value={style.fontSize ?? pixels('font-size', 16)} onChange={fontSize => change(selected, { fontSize })} />
            <Field label="行距" field="lineHeight" value={style.lineHeight ?? pixels('line-height', 24) / pixels('font-size', 16)} onChange={lineHeight => change(selected, { lineHeight })} /></>}
          {item.kind === 'block' && <Field label="区块内间距" field="gap" value={style.gap ?? pixels('gap', 0)} onChange={gap => change(selected, { gap })} />}
        </div>
        <button className="pe-reset-element" onClick={() => change(selected, null)}>恢复此元素</button>
      </fieldset>}
      <small>调整只作用于电脑版；保存后会写入项目文件，部署后公开生效。</small>
    </aside>}
    {desktop && rect && item && <div className="pe-selection" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
      <button className="pe-move" aria-label="拖动所选元素" onPointerDown={event => begin(item.element, event, 'move')}>移动 · {item.kind === 'text' ? '文字' : item.kind === 'media' ? '图像' : '区块'}</button>
      {(item.kind === 'media' ? resizeHandles : ['w', 'e'] as ResizeHandle[]).map(handle => <button key={handle} className={`pe-handle pe-handle--${handle}`} aria-label={`从${resizeHandleNames[handle]}调整大小`} onPointerDown={event => begin(item.element, event, handle)} />)}
    </div>}
  </div>;
}
