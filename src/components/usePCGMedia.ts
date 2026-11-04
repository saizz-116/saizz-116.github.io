import { useEffect, useState } from 'react';
import { pcgPreviewMedia } from '../data/pcg-preview-media';
import type { PCGMedia } from '../data/pcg-preview-media';

let completed: PCGMedia | undefined;
let pending: Promise<PCGMedia> | undefined;
export function preloadPCGMedia() {
  pending ??= import('../data/pcg-critical-media').then(module => {
    completed = module.pcgCriticalMedia;
    return completed;
  }).catch(error => { pending = undefined; throw error; });
  return pending;
}

export function usePCGMedia() {
  const [media, setMedia] = useState(completed ?? pcgPreviewMedia);
  useEffect(() => {
    let active = true;
    void preloadPCGMedia().then(full => { if (active) setMedia(full); }).catch(() => {
      // The bundled preview remains visible even if the full media chunk fails.
    });
    return () => { active = false; };
  }, []);
  return media;
}
