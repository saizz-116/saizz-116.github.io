import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../types';
import MixedLivesCover from './MixedLivesCover';

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [failedSource, setFailedSource] = useState<string>();
  const showImage = project.cover.src && failedSource !== project.cover.src;
  return (
    <article className={`exhibit exhibit--${project.slug}`}>
      <Link to={`/work/${project.slug}`} className="exhibit-link" aria-label={`Open ${project.title}`} style={{ '--cover-color': project.cover.color } as CSSProperties}>
        <div className="exhibit-image">
          {project.slug === 'mixed-lives'
            ? <MixedLivesCover />
            : showImage && <img src={project.cover.src} alt={project.cover.alt} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" onError={() => setFailedSource(project.cover.src)} />}
        </div>
        <div className="exhibit-caption"><h2>{project.homeTitle || project.title}</h2><p>{project.summary}</p></div>
      </Link>
    </article>
  );
}
