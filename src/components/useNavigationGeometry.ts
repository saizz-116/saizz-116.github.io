import { useLayoutEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useHomeLayout } from '../editor/useHomeLayout';
import { navigationGeometry } from './navigationGeometry';

const viewportSize = () => ({ width: document.body.clientWidth, height: window.innerHeight, viewportWidth: window.innerWidth });

export function useNavigationGeometry() {
  const layout = useHomeLayout();
  const [viewport, setViewport] = useState(viewportSize);
  useLayoutEffect(() => {
    const measure = () => {
      const next = viewportSize();
      setViewport(previous => previous.width === next.width && previous.height === next.height && previous.viewportWidth === next.viewportWidth ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  const geometry = navigationGeometry(layout, viewport.width, viewport.height, viewport.viewportWidth);
  const buttonStyle: CSSProperties = { top: geometry.top, width: geometry.width, height: geometry.height,
    fontSize: geometry.fontSize, lineHeight: geometry.lineHeight, padding: `${10 * geometry.scale}px ${13 * geometry.scale}px`,
    gap: 12 * geometry.scale };
  return { layout, geometry, buttonStyle, viewport };
}
