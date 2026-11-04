import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../data/portfolio';
import { LayoutScene } from './LayoutScene';
import {
  cloneLayout, completeLayout, emptyLayout, isLocalEditorHost,
  isFrameItem, itemKinds, pageItemKinds, loadLayout, parseLayoutDocument,
} from './layout';
import type { LayoutBox, LayoutDocument, LayoutGroup, LayoutItemId, LayoutItemKind, ProjectItemKind } from './layout';
import { resizeBox, resizeHandles, resizeHandleNames } from './resize';
import type { ResizeHandle } from './resize';
import './editor.css';

const kindNames: Record<LayoutItemKind, string> = { cover: '封面', title: '标题', description: '说明', name: '姓名', subtitle: '副标题', cv: 'CV 入口', contact: '邮箱' };
const round = (value: number) => Math.round(value * 100) / 100;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));
const same = (left: LayoutDocument, right: LayoutDocument) => JSON.stringify(left) === JSON.stringify(right);

interface DragState {
  pointerId: number;
  id: LayoutItemId;
  mode: 'move' | 'resize';
  clientX: number;
  clientY: number;
  scale: number;
  original: LayoutDocument;
  box: LayoutBox;
  lockAspect: boolean;
  handle: ResizeHandle;
}

function normalizeBox(box: LayoutBox, canvas: LayoutDocument['canvas']): LayoutBox {
  const width = clamp(box.width, 24, canvas.width);
  const height = clamp(box.height, 16, canvas.height);
  return {
    ...box,
    x: round(clamp(box.x, 0, canvas.width - width)),
    y: round(clamp(box.y, 0, canvas.height - height)),
    width: round(width),
    height: round(height),
    ...(box.fontSize !== undefined ? { fontSize: round(clamp(box.fontSize, 8, 100)) } : {}),
    ...(box.lineHeight !== undefined ? { lineHeight: round(clamp(box.lineHeight, 0.8, 3)) } : {}),
  };
}

function NumberField({ label, value, onCommit, min, max, step = 1, disabled = false }: {
  label: string; value: number; onCommit: (value: number) => void;
  min: number; max: number; step?: number; disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(round(value)));
  const skipCommit = useRef(false);
  useEffect(() => setDraft(String(round(value))), [value]);
  return (
    <label className="editor-number-field">
      <span>{label}</span>
      <input type="number" aria-label={label} value={draft} min={min} max={max} step={step} disabled={disabled}
        onChange={event => setDraft(event.target.value)}
        onBlur={() => {
          if (skipCommit.current) { skipCommit.current = false; setDraft(String(round(value))); return; }
          const parsed = Number(draft);
          if (draft.trim() && Number.isFinite(parsed)) {
            const constrained = clamp(parsed, min, max);
            setDraft(String(round(constrained)));
            onCommit(constrained);
          }
          else setDraft(String(round(value)));
        }}
        onKeyDown={event => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') { skipCommit.current = true; setDraft(String(round(value))); event.currentTarget.blur(); }
        }} />
    </label>
  );
}

export default function LayoutEditor() {
  const navigate = useNavigate();
  const [document, setDocumentState] = useState<LayoutDocument>(() => cloneLayout(emptyLayout));
  const documentRef = useRef(document);
  const [saved, setSaved] = useState<LayoutDocument>(() => cloneLayout(emptyLayout));
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<LayoutItemId>('mixed-lives.cover');
  const [past, setPast] = useState<LayoutDocument[]>([]);
  const [future, setFuture] = useState<LayoutDocument[]>([]);
  const [lockAspect, setLockAspect] = useState(true);
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState<number | 'fit'>('fit');
  const [textOverflow, setTextOverflow] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const rangeStart = useRef<LayoutDocument | null>(null);
  const scene = completeLayout(document);
  const selected = scene.items[selectedId]!;
  const [selectedSlug, selectedKind] = selectedId.split('.') as [LayoutGroup, LayoutItemKind];
  const frameSelected = isFrameItem(selectedId);
  const availableKinds = selectedSlug === 'page' ? pageItemKinds : itemKinds;
  const scale = zoom === 'fit' ? fitScale : zoom;
  const dirty = !same(document, saved);
  const local = isLocalEditorHost();

  const setDocument = useCallback((next: LayoutDocument) => {
    documentRef.current = next;
    setDocumentState(next);
  }, []);

  const remember = useCallback((before: LayoutDocument) => {
    setPast(entries => [...entries.slice(-59), cloneLayout(before)]);
    setFuture([]);
  }, []);

  const changeDocument = useCallback((next: LayoutDocument, withHistory = true) => {
    if (same(next, documentRef.current)) return;
    if (withHistory) remember(documentRef.current);
    setDocument(next);
    setError('');
  }, [remember, setDocument]);

  const changeBox = useCallback((id: LayoutItemId, patch: Partial<LayoutBox>, withHistory = true) => {
    const next = completeLayout(documentRef.current);
    next.items[id] = normalizeBox({ ...next.items[id]!, ...patch }, next.canvas);
    changeDocument(next, withHistory);
  }, [changeDocument]);

  useEffect(() => {
    const controller = new AbortController();
    if (!local) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    setError('');
    Promise.all([
      fetch('/__portfolio-editor/status', { cache: 'no-store', signal: controller.signal }).then(async response => {
        if (!response.ok) throw new Error('编辑服务尚未启动，请重新运行 Start Portfolio.cmd。');
        const status: unknown = await response.json();
        if (!status || typeof status !== 'object' || !('enabled' in status) || status.enabled !== true || !('token' in status) || typeof status.token !== 'string' || !('version' in status) || status.version !== 3) {
          throw new Error('编辑服务尚未启动，请重新运行 Start Portfolio.cmd。');
        }
        return status.token;
      }),
      loadLayout(controller.signal),
    ]).then(([sessionToken, layout]) => {
      setToken(sessionToken);
      setDocument(layout);
      setSaved(cloneLayout(layout));
      setPast([]);
      setFuture([]);
    }).catch((reason: unknown) => {
      if (controller.signal.aborted) return;
      setError(reason instanceof SyntaxError ? '编辑服务尚未启动，请重新运行 Start Portfolio.cmd。'
        : reason instanceof Error ? reason.message : '无法打开排版编辑器。');
      setToken(undefined);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [local, loadAttempt, setDocument]);

  useEffect(() => {
    const originalTitle = window.document.title;
    window.document.title = '编辑排版 · Xueyao Jiang';
    return () => { window.document.title = originalTitle; };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const fit = () => setFitScale(Math.max(0.15, Math.min(1.25,
      (viewport.clientWidth - 64) / scene.canvas.width,
      (viewport.clientHeight - 64) / scene.canvas.height)));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [loading, token, scene.canvas.width, scene.canvas.height]);

  // Text stays visible as its width or typography changes; its selection box
  // follows its natural height rather than clipping to the original rectangle.
  useLayoutEffect(() => {
    const artboard = artboardRef.current;
    if (!artboard || loading || !token) return;
    let overflow = false;
    let next: LayoutDocument | undefined;
    for (const element of artboard.querySelectorAll<HTMLElement>('[data-layout-id]')) {
      const id = element.dataset.layoutId as LayoutItemId;
      const text = element.querySelector<HTMLElement>('[data-layout-content]');
      const box = scene.items[id];
      if (id === 'page.cv' && box) {
        const navigation = element.querySelector<HTMLElement>('.layout-page-navigation');
        const label = navigation?.querySelector<HTMLElement>('span');
        const icon = navigation?.querySelector<SVGElement>('svg');
        if (navigation && label && icon) {
          const labelRect = label.getBoundingClientRect();
          const iconRect = icon.getBoundingClientRect();
          if (Math.max(labelRect.height, iconRect.height) / scale > box.height - 20
            || (labelRect.width + iconRect.width) / scale > box.width - 38) overflow = true;
        }
        continue;
      }
      if (!text || !box) continue;
      const height = Math.ceil(text.getBoundingClientRect().height / scale + 1);
      if (box.y + height > scene.canvas.height + 1) overflow = true;
      const safeHeight = Math.min(scene.canvas.height - box.y, Math.max(16, height));
      if (Math.abs(box.height - safeHeight) > 1.5) {
        next ??= completeLayout(documentRef.current);
        next.items[id] = { ...box, height: round(safeHeight) };
      }
    }
    setTextOverflow(overflow);
    if (next && Object.keys(documentRef.current.items).length > 0) {
      const pristine = same(documentRef.current, saved);
      setDocument(next);
      if (pristine) setSaved(cloneLayout(next));
    }
  }, [document, saved, loading, token, scale, scene, setDocument]);

  const undo = useCallback(() => {
    if (saving || dragRef.current || !past.length) return;
    const previous = past[past.length - 1];
    setFuture(entries => [cloneLayout(documentRef.current), ...entries]);
    setPast(entries => entries.slice(0, -1));
    setDocument(cloneLayout(previous));
    setError('');
  }, [past, saving, setDocument]);

  const redo = useCallback(() => {
    if (saving || dragRef.current || !future.length) return;
    const next = future[0];
    setPast(entries => [...entries, cloneLayout(documentRef.current)]);
    setFuture(entries => entries.slice(1));
    setDocument(cloneLayout(next));
    setError('');
  }, [future, saving, setDocument]);

  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return;
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable]')) return;
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [redo, undo]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      const dx = (event.clientX - drag.clientX) / drag.scale;
      const dy = (event.clientY - drag.clientY) / drag.scale;
      const next = completeLayout(drag.original);
      const box = drag.box;
      let changed: LayoutBox;
      if (drag.mode === 'move') changed = { ...box, x: box.x + dx, y: box.y + dy };
      else changed = resizeBox(box, next.canvas, drag.handle, dx, dy, drag.lockAspect);
      next.items[drag.id] = normalizeBox(changed, next.canvas);
      setDocument(next);
    };
    const end = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      if (!same(drag.original, documentRef.current)) remember(drag.original);
    };
    const cancel = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      setDocument(drag.original);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [remember, setDocument]);

  const beginPointer = (id: LayoutItemId, event: ReactPointerEvent<HTMLElement>, mode: DragState['mode'] = 'move', handle: ResizeHandle = 'se') => {
    if (saving || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(id);
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId, id, mode, clientX: event.clientX, clientY: event.clientY,
      scale, original: cloneLayout(documentRef.current), box: { ...completeLayout(documentRef.current).items[id]! },
      lockAspect: lockAspect && id.endsWith('.cover'), handle,
    };
  };

  const keyMove = (id: LayoutItemId, event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(id); return; }
    const delta: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!delta[event.key] || saving || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    setSelectedId(id);
    const box = completeLayout(documentRef.current).items[id]!;
    const amount = event.shiftKey ? 10 : 1;
    changeBox(id, { x: box.x + delta[event.key][0] * amount, y: box.y + delta[event.key][1] * amount });
  };

  const changeDimension = (field: 'width' | 'height', value: number) => {
    const box = completeLayout(documentRef.current).items[selectedId]!;
    if (lockAspect && selectedKind === 'cover') {
      const ratio = box.width / box.height;
      let width = field === 'width' ? value : value * ratio;
      width = clamp(width, Math.max(24, 16 * ratio), Math.min(scene.canvas.width - box.x, (scene.canvas.height - box.y) * ratio));
      changeBox(selectedId, { width, height: width / ratio });
    } else changeBox(selectedId, { [field]: value });
  };

  const finishRange = () => {
    if (rangeStart.current && !same(rangeStart.current, documentRef.current)) remember(rangeStart.current);
    rangeStart.current = null;
  };

  const save = async () => {
    if (!token || saving || textOverflow) return;
    finishRange();
    const layout = parseLayoutDocument(documentRef.current);
    if (!layout) { setError('有元素超出了画布，请调整后再保存。'); return; }
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/__portfolio-editor/layout', {
        method: 'PUT', headers: { 'content-type': 'application/json', 'x-portfolio-editor-token': token },
        body: JSON.stringify({ layout }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== 'object' || !('ok' in result) || result.ok !== true || !('layout' in result)) {
        throw new Error('保存失败，请确认本机编辑服务仍在运行。');
      }
      const stored = parseLayoutDocument(result.layout);
      if (!stored) throw new Error('保存结果不正确，请重试。');
      setDocument(stored);
      setSaved(cloneLayout(stored));
    } catch (reason) { setError(reason instanceof Error ? reason.message : '保存失败，请重试。'); }
    finally { setSaving(false); }
  };

  const leave = () => {
    if (dirty && !window.confirm('还有未保存的调整，要离开编辑器吗？')) return;
    navigate('/');
  };

  if (!local || loading || !token) {
    return <main className="editor-gate">
      <h1>编辑排版</h1>
      <p>{!local ? '此入口仅供本机编辑。' : loading ? '正在打开…' : error}</p>
      <div className="editor-gate-actions">
        {local && !loading && <button type="button" onClick={() => setLoadAttempt(value => value + 1)}>重新连接</button>}
        <button type="button" onClick={() => navigate('/')}>返回首页</button>
      </div>
    </main>;
  }

  const selectionStyle: CSSProperties = { left: selected.x, top: selected.y, width: selected.width, height: selected.height };

  return (
    <main className="editor-shell">
      <header className="editor-toolbar">
        <h1>完整首页排版</h1>
        <button type="button" onClick={() => { if (!dirty || window.confirm('还有未保存的首页调整，确定切换吗？')) navigate('/work/pcg-project?edit=layout'); }}>项目页排版</button>
        <div className="editor-history">
          <button type="button" onClick={undo} disabled={!past.length || saving} title="Ctrl+Z">撤销</button>
          <button type="button" onClick={redo} disabled={!future.length || saving} title="Ctrl+Shift+Z">重做</button>
          <button type="button" onClick={() => changeDocument(cloneLayout(emptyLayout))} disabled={saving}>恢复原布局</button>
        </div>
        <span className={`editor-save-status${error ? ' editor-save-status--error' : ''}`} role="status" aria-live="polite">{error || (saving ? '正在保存…' : dirty ? '未保存' : '已保存')}</span>
        <button type="button" className="editor-save" onClick={save} disabled={!dirty || saving || textOverflow}>{saving ? '保存中…' : '保存'}</button>
        <button type="button" onClick={leave} disabled={saving}>返回首页</button>
      </header>
      <div className="editor-workspace">
        <section className="editor-canvas-column" aria-label="排版画布">
          <div className="editor-canvas-tools">
            <p>{frameSelected ? '拖动元素移动，拖动四角或四边缩放' : '拖动文字移动，拖动左右边调整宽度'}</p>
            <label>缩放
              <select aria-label="画布缩放" value={zoom === 'fit' ? 'fit' : String(zoom)} onChange={event => setZoom(event.target.value === 'fit' ? 'fit' : Number(event.target.value))}>
                <option value="fit">适应屏幕</option><option value="0.5">50%</option><option value="0.75">75%</option><option value="1">100%</option><option value="1.25">125%</option>
              </select>
            </label>
          </div>
          <div className="editor-viewport" ref={viewportRef}>
            <div className="editor-artboard-frame" style={{ width: scene.canvas.width * scale, height: scene.canvas.height * scale }}>
              <div className="editor-artboard" ref={artboardRef} style={{ width: scene.canvas.width, height: scene.canvas.height, transform: `scale(${scale})` }}>
                <LayoutScene layout={scene} editing selectedId={selectedId} onItemPointerDown={beginPointer} onItemKeyDown={keyMove} />
                <div className="editor-selection" style={{ ...selectionStyle, '--handle-scale': 1 / scale } as CSSProperties}>
                  {(frameSelected ? resizeHandles : ['w', 'e'] as ResizeHandle[]).map(handle => (
                    <button key={handle} type="button" className={`editor-resize-handle editor-resize-handle--${handle}`}
                      tabIndex={-1} aria-label={`从${resizeHandleNames[handle]}调整大小`} title={`拖动${resizeHandleNames[handle]}`}
                      disabled={saving} onPointerDown={event => beginPointer(selectedId, event, 'resize', handle)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="editor-canvas-footer"><span>方向键微调 · Shift + 方向键移动 10 像素</span><span>{scene.canvas.width} × {scene.canvas.height} · {Math.round(scale * 100)}%</span></div>
        </section>
        <aside className="editor-inspector" aria-label="元素设置">
          <fieldset disabled={saving}>
            <label className="editor-project-picker">区域
              <select aria-label="选择区域" value={selectedSlug} onChange={event => {
                const group = event.target.value as LayoutGroup;
                const kind = group === 'page' ? pageItemKinds.includes(selectedKind as typeof pageItemKinds[number]) ? selectedKind : 'name'
                  : itemKinds.includes(selectedKind as ProjectItemKind) ? selectedKind : 'cover';
                setSelectedId(`${group}.${kind}` as LayoutItemId);
              }}>
                <option value="page">首页元素</option>
                {projects.map(project => <option key={project.slug} value={project.slug}>{project.title}</option>)}
              </select>
            </label>
            <div className="editor-kind-picker" role="group" aria-label="元素类型">
              {availableKinds.map(kind => <button type="button" key={kind} aria-pressed={selectedKind === kind} onClick={() => setSelectedId(`${selectedSlug}.${kind}` as LayoutItemId)}>{kindNames[kind]}</button>)}
            </div>
            <h2>位置</h2>
            <div className="editor-field-grid">
              <NumberField label="水平位置" value={selected.x} min={0} max={scene.canvas.width - selected.width} onCommit={value => changeBox(selectedId, { x: value })} />
              <NumberField label="垂直位置" value={selected.y} min={0} max={scene.canvas.height - selected.height} onCommit={value => changeBox(selectedId, { y: value })} />
            </div>
            <h2>大小</h2>
            <div className="editor-field-grid">
              <NumberField label="宽度" value={selected.width} min={24} max={scene.canvas.width - selected.x} onCommit={value => changeDimension('width', value)} />
              <NumberField label="高度" value={selected.height} min={16} max={scene.canvas.height - selected.y} disabled={!frameSelected} onCommit={value => changeDimension('height', value)} />
            </div>
            {selectedKind === 'cover' ? <label className="editor-check"><input type="checkbox" checked={lockAspect} onChange={event => setLockAspect(event.target.checked)} />保持比例</label> : <>
              <h2>文字</h2>
              <div className="editor-field-grid">
                <NumberField label="字号" value={selected.fontSize!} min={8} max={100} step={0.5} onCommit={value => changeBox(selectedId, { fontSize: value })} />
                <NumberField label="行距" value={selected.lineHeight!} min={0.8} max={3} step={0.05} onCommit={value => changeBox(selectedId, { lineHeight: value })} />
              </div>
              <input className="editor-font-slider" type="range" aria-label="拖动调整字号" min={8} max={100} step={0.5} value={selected.fontSize!}
                onFocus={() => { rangeStart.current ??= cloneLayout(documentRef.current); }}
                onPointerDown={() => { rangeStart.current ??= cloneLayout(documentRef.current); }}
                onChange={event => {
                  rangeStart.current ??= cloneLayout(documentRef.current);
                  changeBox(selectedId, { fontSize: Number(event.target.value) }, false);
                }}
                onPointerUp={finishRange} onBlur={finishRange} />
              <p className="editor-field-note">{selectedKind === 'cv' ? '可调整按钮宽高和文字大小' : '文字高度随内容变化'}</p>
            </>}
          </fieldset>
          {error && <p className="editor-overflow" role="alert">{error}</p>}
          {textOverflow && <p className="editor-overflow" role="alert">文字超出画布或按钮，请增大元素或减小字号。</p>}
          <p className="editor-persistence-note">保存后更新本地完整首页，线上网站需重新部署。手机版保持自动排版。</p>
        </aside>
      </div>
    </main>
  );
}
