import { useLayoutEffect, useRef, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/portfolio';
import { LayoutScene } from './LayoutScene';
import { useDesktopLayout } from './useDesktopLayout';
import { useNavigationGeometry } from '../components/useNavigationGeometry';
import { desktopRenderLayout } from '../components/navigationGeometry';

export default function HomeGallery() {
  const desktop = useDesktopLayout();
  const { layout, viewport } = useNavigationGeometry();
  const [frame, setFrame] = useState({ x: 0, y: 0, scale: 1 });
  const stage = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      const next = { x: rect.left, y: rect.top, scale: node.clientWidth / layout.canvas.width };
      setFrame(previous => previous.x === next.x && previous.y === next.y && previous.scale === next.scale ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [layout, desktop, viewport.width, viewport.height]);
  const aspect = layout.canvas.width / layout.canvas.height;
  const displayLayout = desktop ? desktopRenderLayout(layout, viewport.width, viewport.height, viewport.viewportWidth, frame) : layout;
  return (
    <section ref={stage} className={desktop ? 'home-full-layout' : 'exhibition'} aria-label={desktop ? 'Portfolio homepage' : 'Selected projects'}
      style={desktop ? { width: `min(100%, calc(100svh * ${aspect}))`, aspectRatio: String(aspect) } : undefined}>
      {desktop ? <div className="home-layout-scaled" style={{ transform: `scale(${frame.scale})` }}><LayoutScene layout={displayLayout} chromeScale={1 / frame.scale} /></div>
        : projects.map((project, index) => <ProjectCard project={project} index={index} key={project.id} />)}
    </section>
  );
}
