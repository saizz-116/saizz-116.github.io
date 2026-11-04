import { useEffect, useSyncExternalStore } from 'react';
import { emptyLayout, loadLayout } from './layout';

let cached = emptyLayout;
let pending: Promise<void> | undefined;
const listeners = new Set<() => void>();
const snapshot = () => cached;
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

function refresh() {
  pending ??= loadLayout().then(layout => {
    cached = layout;
    listeners.forEach(listener => listener());
  }).catch(() => { /* Keep the last saved composition if the request fails. */ }).finally(() => { pending = undefined; });
}

/** A shared read keeps navigation and the full homepage aligned without duplicate requests. */
export function useHomeLayout() {
  const layout = useSyncExternalStore(subscribe, snapshot);
  useEffect(refresh, []);
  return layout;
}
