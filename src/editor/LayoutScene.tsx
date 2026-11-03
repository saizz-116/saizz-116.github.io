import { useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import MixedLivesCover from '../components/MixedLivesCover';
import { projects } from '../data/portfolio';
import type { Project } from '../types';
import { completeLayout, itemKinds } from './layout';
import type { LayoutDocument, LayoutItemId } from './layout';

interface LayoutSceneProps {
  layout: LayoutDocument;
  editing?: boolean;
  selectedId?: LayoutItemId | null;
  onItemPointerDown?: (id: LayoutItemId, event: PointerEvent<HTMLElement>) => void;
  onItemKeyDown?: (id: LayoutItemId, event: KeyboardEvent<HTMLElement>) => void;
}

function Cover({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="layout-cover" style={{ background: project.cover.color }}>
      {project.slug === 'mixed-lives' ? <MixedLivesCover /> : project.cover.src && !failed && (
        <img src={project.cover.src} alt={project.cover.alt} draggable={false} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export function LayoutScene({ layout, editing = false, selectedId, onItemPointerDown, onItemKeyDown }: LayoutSceneProps) {
  const complete = completeLayout(layout);
  return (
    <div className={`layout-scene${editing ? ' layout-scene--editing' : ''}`} style={{ width: complete.canvas.width, height: complete.canvas.height }}>
      {projects.flatMap(project => itemKinds.map(kind => {
        const id = `${project.slug}.${kind}` as LayoutItemId;
        const box = complete.items[id]!;
        const className = `layout-piece layout-piece--${kind}${selectedId === id ? ' layout-piece--selected' : ''}`;
        const style: CSSProperties = { left: box.x, top: box.y, width: box.width,
          ...(kind === 'cover' ? { height: box.height } : { minHeight: box.height, fontSize: box.fontSize, lineHeight: box.lineHeight }) };
        const content = kind === 'cover' ? <Cover project={project} />
          : kind === 'title' ? <h2>{project.homeTitle || project.title}</h2> : <p>{project.summary}</p>;
        const label = `${project.title} · ${kind === 'cover' ? '封面' : kind === 'title' ? '标题' : '说明'}`;
        return editing ? (
          <div key={id} className={className} style={style} data-layout-id={id} data-layout-kind={kind} data-selected={selectedId === id}
            role="button" aria-label={label} aria-pressed={selectedId === id} tabIndex={0}
            onPointerDown={event => onItemPointerDown?.(id, event)} onKeyDown={event => onItemKeyDown?.(id, event)}>
            {content}
          </div>
        ) : (
          <Link key={id} to={`/work/${project.slug}`} className={className} style={style} data-layout-id={id}
            aria-label={kind === 'cover' ? `Open ${project.title}` : undefined}>
            {content}
          </Link>
        );
      }))}
    </div>
  );
}
