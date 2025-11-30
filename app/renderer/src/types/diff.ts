export type DiffGranularity = 'line' | 'word' | 'char';
export type DiffViewMode = 'split' | 'unified';

export type HighlightRange = {
  value: string;
  type: 'added' | 'removed' | 'unchanged';
};

export type DiffRow = {
  id: string;
  leftNumber: number | null;
  rightNumber: number | null;
  leftText: string | null;
  rightText: string | null;
  type: 'unchanged' | 'added' | 'removed' | 'changed';
  blockIndex: number | null;
  highlights?: {
    left: HighlightRange[];
    right: HighlightRange[];
  };
};

export type DiffStats = {
  additions: number;
  deletions: number;
  changes: number;
};

export type CollapsibleRange = {
  start: number;
  end: number;
};

export type DiffResult = {
  rows: DiffRow[];
  stats: DiffStats;
  blocks: number[];
  patch: string;
  collapsible: CollapsibleRange[];
};

export type DiffOptions = {
  granularity: DiffGranularity;
  jsonMode: boolean;
  whitespaceSensitive: boolean;
  collapseThreshold: number;
};
