import { useEffect, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { Project } from '../types';
import { emotionalVacuumChapters, mixedLivesChapters } from '../data/projectChapters';
import { useNavigationGeometry } from './useNavigationGeometry';

function NavArrow({ back = false }: { back?: boolean }) {
  return <svg className={back ? 'project-header-arrow project-header-arrow--back' : 'project-header-arrow'} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13" stroke="currentColor" strokeWidth="1.35" /></svg>;
}

export default function ProjectHeader({ project }: { project: Project }) {
  const { geometry, buttonStyle, viewport } = useNavigationGeometry();
  const [showChapters, setShowChapters] = useState(false);
  const chapters = project.slug === 'emotional-vacuum' ? emotionalVacuumChapters : project.slug === 'mixed-lives' ? mixedLivesChapters : [];
  const [active, setActive] = useState(chapters[0]?.id ?? '');
  const { headerHeight } = geometry;

  useLayoutEffect(() => {
    const root = document.documentElement;
    const original = root.style.getPropertyValue('--project-scroll-offset');
    root.style.setProperty('--project-scroll-offset', `${headerHeight + 16}px`);
    return () => { if (original) root.style.setProperty('--project-scroll-offset', original); else root.style.removeProperty('--project-scroll-offset'); };
  }, [headerHeight]);

  useEffect(() => {
    const marker = document.getElementById('project-chapters');
    if (!chapters.length || !marker) return;
    const chapterThreshold = headerHeight + (project.slug === 'mixed-lives' ? 16 : 0);
    const observer = new IntersectionObserver(([entry]) => {
      setShowChapters(entry.boundingClientRect.bottom <= chapterThreshold + 1);
    }, { rootMargin: `-${chapterThreshold}px 0px 0px 0px`, threshold: 0 });
    observer.observe(marker);
    const sections = project.slug === 'mixed-lives' ? null : new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: `-${headerHeight + 16}px 0px -${Math.max(0, viewport.height - headerHeight - 120)}px 0px`, threshold: 0 });
    chapters.forEach(chapter => { const section = document.getElementById(chapter.id); if (section) sections?.observe(section); });
    let frame = 0;
    const updateActiveChapter = () => {
      frame = 0;
      let current = chapters[0].id;
      for (const chapter of chapters) {
        const section = document.getElementById(chapter.id);
        if (section && section.getBoundingClientRect().top <= headerHeight + 24) current = chapter.id;
      }
      setActive(current);
    };
    const queueChapterUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateActiveChapter);
    };
    if (project.slug === 'mixed-lives') {
      window.addEventListener('scroll', queueChapterUpdate, { passive: true });
      updateActiveChapter();
    }
    return () => {
      observer.disconnect(); sections?.disconnect();
      window.removeEventListener('scroll', queueChapterUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [project.slug, headerHeight, viewport.height, chapters]);

  const centerGap = viewport.viewportWidth <= 380 ? 0 : viewport.viewportWidth <= 1100 ? 10 : 26 * geometry.scale;
  const backLeft = geometry.left;
  const cvLeft = geometry.cvLeft;
  const centerLeft = backLeft + geometry.width + centerGap;
  const centerWidth = Math.max(0, cvLeft - centerLeft - centerGap);
  const centerStyle: CSSProperties = { left: centerLeft, top: geometry.top, width: centerWidth,
    height: geometry.height, '--project-title-size': `${27 * geometry.scale}px` } as CSSProperties;

  return <>
    <header className="project-header" style={{ height: headerHeight }}>
      <nav aria-label="Project navigation">
        <Link className="project-header-button" to="/" aria-label="Back to portfolio" style={{ ...buttonStyle, left: backLeft }}><span>Portfolio</span><NavArrow back /></Link>
        <div className="project-header-center" style={centerStyle}>
          <div className="project-header-heading" hidden={showChapters}>
            <a className="project-header-title" href="#main" title={project.title}>{project.title}</a>
            <span className="project-header-meta">{project.medium}{project.year && ` / ${project.year}`}</span>
          </div>
          {chapters.length > 0 && <div className="project-header-contents" hidden={!showChapters}>
            <nav className="project-header-chapters" aria-label="Fixed project chapters">
              {chapters.map(chapter => <a href={`#${chapter.id}`} key={chapter.id} aria-current={active === chapter.id ? 'location' : undefined}>{chapter.label}</a>)}
            </nav>
            <svg className="project-header-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" /></svg>
            <select className="project-header-chapter-select" aria-label="Project chapters" value={active} onChange={event => {
              const id = event.target.value;
              setActive(id);
              document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: project.slug === 'mixed-lives' || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
            }}>{chapters.map(chapter => <option value={chapter.id} key={chapter.id}>{chapter.label}</option>)}</select>
          </div>}
        </div>
        <Link className="project-header-button" to="/cv" style={{ ...buttonStyle, left: cvLeft }}><span>CV</span><NavArrow /></Link>
      </nav>
    </header>
    <div className="project-header-space" aria-hidden="true" style={{ height: headerHeight }} />
  </>;
}
