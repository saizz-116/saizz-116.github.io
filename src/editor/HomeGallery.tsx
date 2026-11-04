import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/portfolio';
import { LayoutScene } from './LayoutScene';
import { emptyLayout, loadLayout } from './layout';
import type { LayoutDocument } from './layout';

// Reuse the saved composition immediately when returning from another page.
// The background read still picks up changes saved in the local layout editor.
let lastHomeLayout = emptyLayout;

export default function HomeGallery() {
  const [layout, setLayout] = useState<LayoutDocument>(() => lastHomeLayout);
  const [scale, setScale] = useState(1);
  const stage = useRef<HTMLElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    loadLayout(controller.signal).then(saved => {
      lastHomeLayout = saved;
      setLayout(saved);
    }).catch(() => { /* Keep the last known layout if the file is unavailable. */ });
    return () => controller.abort();
  }, []);
  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => setScale(node.clientWidth / layout.canvas.width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [layout]);
  const custom = Object.keys(layout.items).length > 0;
  const aspect = layout.canvas.width / layout.canvas.height;
  return (
    <section ref={stage} className={`exhibition${custom ? ' exhibition--custom' : ''}`} aria-label="Selected projects"
      style={custom ? { width: `min(1300px, calc((100svh - 210px) * ${aspect}), 100%)`, height: 'auto', minHeight: 0, aspectRatio: String(aspect) } : undefined}>
      {custom ? <div className="home-layout-scaled" style={{ transform: `scale(${scale})` }}><LayoutScene layout={layout} /></div>
        : projects.map((project, index) => <ProjectCard project={project} index={index} key={project.id} />)}
    </section>
  );
}
