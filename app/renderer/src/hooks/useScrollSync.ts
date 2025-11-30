import { useCallback, useRef } from 'react';

export function useScrollSync(enabled: boolean) {
  const panesRef = useRef<Array<HTMLElement | null>>([]);
  const isSyncing = useRef(false);

  const registerPane = useCallback((index: number) => {
    return (node: HTMLElement | null) => {
      panesRef.current[index] = node;
    };
  }, []);

  const handleScroll = useCallback(
    (index: number) => {
      return () => {
        if (!enabled || isSyncing.current) {
          return;
        }
        const source = panesRef.current[index];
        if (!source) {
          return;
        }
        isSyncing.current = true;
        panesRef.current.forEach((pane, paneIndex) => {
          if (pane && paneIndex !== index) {
            pane.scrollTop = source.scrollTop;
          }
        });
        requestAnimationFrame(() => {
          isSyncing.current = false;
        });
      };
    },
    [enabled]
  );

  return { registerPane, handleScroll };
}
