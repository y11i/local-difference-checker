import { createTwoFilesPatch, diffChars, diffLines, diffWordsWithSpace } from 'diff';
import type { DiffOptions, DiffResult, DiffRow, HighlightRange } from '@/types/diff';
import { stableStringify } from './json';

type PendingChanges = {
  additions: string[];
  removals: string[];
};

const NEWLINE = /\r?\n/;

export function buildDiff(left: string, right: string, options: DiffOptions): DiffResult {
  const preparedLeft = options.jsonMode ? stableStringify(left, true) : left;
  const preparedRight = options.jsonMode ? stableStringify(right, true) : right;

  const changes = diffLines(preparedLeft, preparedRight, { ignoreWhitespace: !options.whitespaceSensitive });

  const rows: DiffRow[] = [];
  const blocks: number[] = [];
  const stats = { additions: 0, deletions: 0, changes: 0 };
  const collapsibleRanges: DiffResult['collapsible'] = [];

  let currentBlock: number | null = null;
  let blockId = 0;
  let rowId = 0;
  let leftLineNumber = 1;
  let rightLineNumber = 1;
  const pending: PendingChanges = { additions: [], removals: [] };

  const commitPending = () => {
    if (pending.additions.length === 0 && pending.removals.length === 0) {
      if (currentBlock !== null) {
        currentBlock = null;
      }
      return;
    }

    if (currentBlock === null) {
      currentBlock = blockId++;
      blocks.push(rows.length);
    }

    const max = Math.max(pending.additions.length, pending.removals.length);
    for (let i = 0; i < max; i += 1) {
      const leftText = pending.removals[i] ?? null;
      const rightText = pending.additions[i] ?? null;
      let type: DiffRow['type'] = 'changed';

      if (leftText && !rightText) {
        type = 'removed';
      } else if (!leftText && rightText) {
        type = 'added';
      }

      const row: DiffRow = {
        id: `row-${rowId++}`,
        leftNumber: leftText !== null ? leftLineNumber++ : null,
        rightNumber: rightText !== null ? rightLineNumber++ : null,
        leftText,
        rightText,
        type,
        blockIndex: currentBlock
      };

      if (type === 'changed' && leftText && rightText) {
        row.highlights = {
          left: createHighlightRanges(leftText, rightText, options),
          right: createHighlightRanges(rightText, leftText, options)
        };
        stats.changes += 1;
      } else if (type === 'added') {
        stats.additions += 1;
      } else if (type === 'removed') {
        stats.deletions += 1;
      }

      rows.push(row);
    }

    pending.additions = [];
    pending.removals = [];
    currentBlock = null;
  };

  for (const change of changes) {
    const segments = segmentLines(change.value);

    if (change.added) {
      pending.additions.push(...segments);
      continue;
    }

    if (change.removed) {
      pending.removals.push(...segments);
      continue;
    }

    commitPending();
    for (const segment of segments) {
      const row: DiffRow = {
        id: `row-${rowId++}`,
        leftNumber: leftLineNumber++,
        rightNumber: rightLineNumber++,
        leftText: segment,
        rightText: segment,
        type: 'unchanged',
        blockIndex: null
      };
      rows.push(row);
    }
  }

  commitPending();

  // Determine collapsible ranges for unchanged rows.
  let currentStart = -1;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.type === 'unchanged') {
      if (currentStart === -1) {
        currentStart = i;
      }
    } else if (currentStart !== -1) {
      if (i - currentStart > options.collapseThreshold) {
        collapsibleRanges.push({ start: currentStart, end: i - 1 });
      }
      currentStart = -1;
    }
  }

  if (currentStart !== -1 && rows.length - currentStart > options.collapseThreshold) {
    collapsibleRanges.push({ start: currentStart, end: rows.length - 1 });
  }

  const patch = createTwoFilesPatch('Original', 'Modified', preparedLeft, preparedRight, '', '', { context: 3 });

  return {
    rows,
    stats,
    blocks,
    patch,
    collapsible: collapsibleRanges
  };
}

function segmentLines(value: string): string[] {
  const lines = value.split(NEWLINE);
  if (lines.length && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function createHighlightRanges(source: string, comparison: string, options: DiffOptions): HighlightRange[] {
  if (options.granularity === 'line') {
    return [{ type: 'unchanged', value: source }];
  }

  const diffFn = options.granularity === 'char' ? diffChars : diffWordsWithSpace;
  const segments = diffFn(source, comparison);
  const highlights: HighlightRange[] = [];

  for (const segment of segments) {
    if (segment.added) {
      highlights.push({ type: 'added', value: segment.value });
    } else if (segment.removed) {
      highlights.push({ type: 'removed', value: segment.value });
    } else {
      highlights.push({ type: 'unchanged', value: segment.value });
    }
  }

  return highlights.filter((highlight) => highlight.value.length > 0);
}
