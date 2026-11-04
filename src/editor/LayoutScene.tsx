import { useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import MixedLivesCover from '../components/MixedLivesCover';
import { profile, projects } from '../data/portfolio';
import { coverImageSizes } from '../data/cover-images';
import type { Project } from '../types';
import { completeLayout, isFrameItem, itemKinds } from './layout';
import type { LayoutDocument, LayoutItemId } from './layout';
import { preloadPCGMedia } from '../components/usePCGMedia';

interface LayoutSceneProps {
  layout: LayoutDocument;
  editing?: boolean;
  chromeScale?: number;
  selectedId?: LayoutItemId | null;
  onItemPointerDown?: (id: LayoutItemId, event: PointerEvent<HTMLElement>) => void;
  onItemKeyDown?: (id: LayoutItemId, event: KeyboardEvent<HTMLElement>) => void;
}

function Cover({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="layout-cover" style={{ background: project.cover.color }}>
      {project.slug === 'mixed-lives' ? <MixedLivesCover /> : project.cover.src && !failed && (
        <img src={project.cover.src} srcSet={project.cover.srcSet} sizes={project.cover.srcSet ? coverImageSizes : undefined} width={project.cover.width} height={project.cover.height} alt={project.cover.alt} fetchPriority={project.slug === 'emotional-vacuum' ? 'high' : 'auto'} decoding="async" draggable={false} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export function LayoutScene({ layout, editing = false, chromeScale = 1, selectedId, onItemPointerDown, onItemKeyDown }: LayoutSceneProps) {
  const complete = completeLayout(layout);
  const arrow = <svg className="layout-page-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13" stroke="currentColor" strokeWidth="1.35" /></svg>;
  const piece = (id: LayoutItemId, content: ReactNode, label: string, to?: string, href?: string) => {
    const box = complete.items[id]!;
    const kind = id.split('.')[1];
    const className = `layout-piece layout-piece--${kind}${selectedId === id ? ' layout-piece--selected' : ''}`;
    const style: CSSProperties = { left: box.x, top: box.y, width: box.width,
      ...(isFrameItem(id) ? { height: box.height, fontSize: box.fontSize, lineHeight: box.lineHeight }
        : { minHeight: box.height, fontSize: box.fontSize, lineHeight: box.lineHeight }) };
    const shared = { className, style, 'data-layout-id': id, 'data-layout-kind': kind };
    if (editing) return <div key={id} {...shared} data-selected={selectedId === id}
      role="button" aria-label={label} aria-pressed={selectedId === id} tabIndex={0}
      onPointerDown={event => onItemPointerDown?.(id, event)} onKeyDown={event => onItemKeyDown?.(id, event)}>{content}</div>;
    if (to) return <Link key={id} {...shared} to={to} aria-label={label}
      onPointerEnter={to === '/work/pcg-project' ? () => { void preloadPCGMedia().catch(() => {}); } : undefined}
      onFocus={to === '/work/pcg-project' ? () => { void preloadPCGMedia().catch(() => {}); } : undefined}>{content}</Link>;
    if (href) return <a key={id} {...shared} href={href}>{content}</a>;
    return <div key={id} {...shared}>{content}</div>;
  };
  return (
    <div className={`layout-scene${editing ? ' layout-scene--editing' : ''}`} style={{ width: complete.canvas.width, height: complete.canvas.height, '--layout-chrome-scale': chromeScale } as CSSProperties}>
      {piece('page.name', <h1 data-layout-content>{profile.name}</h1>, editing ? '姓名' : `${profile.name}, portfolio homepage`, '/')}
      {piece('page.subtitle', <p data-layout-content>Portfolio</p>, 'Portfolio 副标题')}
      {piece('page.cv', <div className="layout-page-navigation"><span>CV</span>{arrow}</div>, 'CV', '/cv')}
      {projects.flatMap(project => itemKinds.map(kind => {
        const id = `${project.slug}.${kind}` as LayoutItemId;
        const content = kind === 'cover' ? <Cover project={project} />
          : kind === 'title' ? <h2 data-layout-content>{project.homeTitle || project.title}</h2> : <p data-layout-content>{project.summary}</p>;
        const label = `${project.title} · ${kind === 'cover' ? '封面' : kind === 'title' ? '标题' : '说明'}`;
        return piece(id, content, editing ? label : kind === 'cover' ? `Open ${project.title}` : kind === 'description' ? project.summary : project.title, `/work/${project.slug}`);
      }))}
      {piece('page.contact', <div className="layout-page-contact" data-layout-content><span>{profile.email}</span>{arrow}</div>, '联系邮箱', undefined, `mailto:${profile.email}`)}
    </div>
  );
}
