import { useSyncExternalStore } from 'react';

const desktopQuery = '(min-width: 1101px)';
function subscribe(onChange: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const snapshot = () => window.matchMedia(desktopQuery).matches;

export function useDesktopLayout() {
  return useSyncExternalStore(subscribe, snapshot);
}
