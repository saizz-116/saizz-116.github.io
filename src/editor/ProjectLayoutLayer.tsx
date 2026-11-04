import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isLocalEditorHost } from './layout';
import { emptyProjectLayouts, isProjectSlug, parseProjectLayouts, projectLayoutCSS, registerProjectElements } from './project-layout';
import type { ProjectLayouts, ProjectPageLayout } from './project-layout';

const ProjectLayoutEditor = lazy(() => import('./ProjectLayoutEditor'));

export default function ProjectLayoutLayer({ slug }: { slug: string }) {
  const location = useLocation();
  const editing = isLocalEditorHost() && new URLSearchParams(location.search).get('edit') === 'layout';
  const [layouts, setLayouts] = useState<ProjectLayouts>(emptyProjectLayouts);
  const [preview, setPreview] = useState<ProjectPageLayout | null>(null);
  const [available, setAvailable] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/project-layout.json', { signal: controller.signal, cache: 'no-cache' })
      .then(async response => { if (!response.ok) throw new Error('无法读取项目排版配置'); return response.json(); })
      .then(value => { const parsed = parseProjectLayouts(value); if (!parsed) throw new Error('项目排版文件格式不正确'); setLayouts(parsed); setLoaded(true); })
      .catch(error => { if (!controller.signal.aborted) { setLoadError(String(error.message)); setLoaded(true); } });
    if (isLocalEditorHost()) fetch('/__portfolio-editor/status', { cache: 'no-store', signal: controller.signal })
      .then(response => response.json()).then(status => setAvailable(status.enabled === true && status.version === 3)).catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    registerProjectElements();
    const root = document.querySelector('main#main');
    if (!root) return;
    const observer = new MutationObserver(() => registerProjectElements());
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [slug]);
  const page = preview ?? (isProjectSlug(slug) ? layouts.pages[slug] : {}) ?? {};
  return <>
    <style>{projectLayoutCSS(page)}</style>
    {editing && isProjectSlug(slug) ? <Suspense fallback={<p className="project-editor-loading">正在打开排版工具…</p>}>
      {loaded && <ProjectLayoutEditor slug={slug} initial={layouts.pages[slug] ?? {}} loadError={loadError} onPreview={setPreview} />}
    </Suspense> : available && <a className="project-editor-entry" href={`?edit=layout`}>编辑本页排版 ↗</a>}
  </>;
}
