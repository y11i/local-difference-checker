/// <reference lib="webworker" />
import { buildDiff } from '@/lib/diffEngine';
import type { DiffOptions, DiffResult } from '@/types/diff';

type WorkerRequest = {
  left: string;
  right: string;
  options: DiffOptions;
};

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const payload = event.data;
  const diff = buildDiff(payload.left, payload.right, payload.options);
  const message: DiffResult = diff;
  self.postMessage(message);
};
