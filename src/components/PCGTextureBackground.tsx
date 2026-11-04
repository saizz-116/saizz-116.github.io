import type { CSSProperties } from 'react';
import type { PCGMedia } from '../data/pcg-preview-media';

export default function PCGTextureBackground({ media }: { media: PCGMedia }) {
  return <div className="pcg-texture-background" aria-hidden="true" style={{
    '--pcg-mosaic': `url("${media.mosaic}")`,
    '--pcg-blue': `url("${media.blue}")`,
    '--pcg-wall': `url("${media.wall}")`,
  } as CSSProperties}>
    <div className="pcg-texture-panel pcg-texture-panel--mosaic" />
    <div className="pcg-texture-panel pcg-texture-panel--roof" />
    <div className="pcg-texture-panel pcg-texture-panel--wall" />
  </div>;
}
