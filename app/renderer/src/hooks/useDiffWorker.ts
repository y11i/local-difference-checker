import { useCallback, useEffect, useRef, useState } from 'react';
import type { DiffOptions, DiffResult } from '@/types/diff';

export function useDiffWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/diffWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<DiffResult>) => {
      setResult(event.data);
      setIsComputing(false);
      setError(null);
    };
    worker.onerror = (evt) => {
      setIsComputing(false);
      setError(evt.message);
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const runDiff = useCallback((left: string, right: string, options: DiffOptions) => {
    if (!workerRef.current) {
      return;
    }
    setIsComputing(true);
    workerRef.current.postMessage({ left, right, options });
  }, []);

  return { result, isComputing, error, runDiff };
}
