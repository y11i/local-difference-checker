import { memo, useMemo } from 'react';
import type { CollapsibleRange, DiffRow, DiffViewMode } from '@/types/diff';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type DiffViewerProps = {
  rows: DiffRow[];
  viewMode: DiffViewMode;
  whitespaceVisible: boolean;
  searchTerm: string;
  highlightedBlock: number | null;
  expandedRanges: Set<string>;
  collapsible: CollapsibleRange[];
  onToggleRange: (key: string) => void;
  registerBlockRef: (blockIndex: number, element: HTMLDivElement | null) => void;
  fontSize: number;
  fontFamily: string;
};

export const DiffViewer = memo(
  ({
    rows,
    viewMode,
    whitespaceVisible,
    searchTerm,
    highlightedBlock,
    expandedRanges,
    collapsible,
    onToggleRange,
    registerBlockRef,
    fontSize,
    fontFamily
  }: DiffViewerProps) => {
    const collapseMap = useMemo(() => {
      const map = new Map<number, CollapsibleRange>();
      collapsible.forEach((range) => map.set(range.start, range));
      return map;
    }, [collapsible]);

    const content: Array<JSX.Element> = [];
    let index = 0;
    while (index < rows.length) {
      const range = collapseMap.get(index);
      if (range && !expandedRanges.has(makeRangeKey(range))) {
        content.push(
          <div key={`collapse-${range.start}`} className="flex items-center justify-between bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>
              {range.end - range.start + 1} unchanged lines collapsed ({range.start + 1} – {range.end + 1})
            </span>
            <Button size="sm" variant="ghost" onClick={() => onToggleRange(makeRangeKey(range))}>
              Expand
            </Button>
          </div>
        );
        index = range.end + 1;
        continue;
      }

      const row = rows[index];
      const isHighlighted = row.blockIndex !== null && row.blockIndex === highlightedBlock;
      const previousBlock = index > 0 ? rows[index - 1].blockIndex : null;
      const refCallback =
        row.blockIndex !== null && row.blockIndex !== previousBlock
          ? (node: HTMLDivElement | null) => registerBlockRef(row.blockIndex!, node)
          : undefined;

      content.push(
        <div
          key={row.id}
          ref={refCallback}
          className={cn(
            'border-b border-border/70 text-sm transition-colors',
            row.type === 'added' && 'bg-emerald-500/10',
            row.type === 'removed' && 'bg-red-500/10',
            row.type === 'changed' && 'bg-amber-500/10',
            isHighlighted && 'ring-2 ring-primary',
            viewMode === 'split' ? 'grid grid-cols-[64px_1fr_64px_1fr]' : 'grid grid-cols-[64px_1fr]'
          )}
          style={{ fontFamily, fontSize }}
          data-row-index={index}
          data-block-index={row.blockIndex ?? undefined}
          title={row.type === 'added' ? 'Added' : row.type === 'removed' ? 'Removed' : row.type === 'changed' ? 'Modified' : 'Unchanged'}
        >
          {viewMode === 'split' ? (
            <>
              <LineNumber value={row.leftNumber} type={row.type} />
              <LineValue
                value={row.leftText}
                highlights={row.highlights?.left}
                type={row.type === 'added' ? 'unchanged' : row.type}
                whitespaceVisible={whitespaceVisible}
                searchTerm={searchTerm}
              />
              <LineNumber value={row.rightNumber} type={row.type} align="right" />
              <LineValue
                value={row.rightText}
                highlights={row.highlights?.right}
                type={row.type === 'removed' ? 'unchanged' : row.type}
                whitespaceVisible={whitespaceVisible}
                searchTerm={searchTerm}
                align="right"
              />
            </>
          ) : (
            <>
              <LineNumber
                value={row.leftNumber ?? row.rightNumber}
                type={row.type}
                prefix={row.type === 'added' ? '+' : row.type === 'removed' ? '-' : row.type === 'changed' ? '±' : ' '}
              />
              <LineValue
                value={row.rightText ?? row.leftText}
                highlights={row.highlights?.right ?? row.highlights?.left}
                type={row.type}
                whitespaceVisible={whitespaceVisible}
                searchTerm={searchTerm}
              />
            </>
          )}
        </div>
      );

      index += 1;
    }

    if (content.length === 0) {
      return (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Start typing or load files to see the diff.
        </div>
      );
    }

    return <div className="rounded-xl border">{content}</div>;
  }
);
DiffViewer.displayName = 'DiffViewer';

type LineNumberProps = {
  value: number | null;
  type: DiffRow['type'];
  align?: 'left' | 'right';
  prefix?: string;
};

function LineNumber({ value, type, align = 'left', prefix }: LineNumberProps) {
  return (
    <div
      className={cn(
        'px-3 py-1 text-xs font-semibold text-muted-foreground/70',
        align === 'right' ? 'text-right' : 'text-left',
        type === 'added' && 'text-emerald-600',
        type === 'removed' && 'text-red-600',
        type === 'changed' && 'text-amber-600'
      )}
    >
      {prefix && <span className="mr-1">{prefix}</span>}
      {value ?? ''}
    </div>
  );
}

type LineValueProps = {
  value: string | null;
  highlights?: { value: string; type: 'added' | 'removed' | 'unchanged' }[];
  type: DiffRow['type'];
  whitespaceVisible: boolean;
  searchTerm: string;
  align?: 'left' | 'right';
};

function LineValue({ value, highlights, type, whitespaceVisible, searchTerm, align = 'left' }: LineValueProps) {
  const text = value ?? '';
  const segments = highlights ?? [{ value: text, type: 'unchanged' }];
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return (
    <div className={cn('px-3 py-1 whitespace-pre-wrap font-mono text-sm', align === 'right' && 'text-right')}>
      {segments.map((segment, index) => {
        const parts = normalizedSearch ? splitBySearch(segment.value, normalizedSearch) : [segment.value];

        return (
          <span key={`${segment.type}-${index}`} className={segmentClass(segment.type, type)}>
            {parts.map((part, idx) => {
              if (normalizedSearch && part.toLowerCase() === normalizedSearch) {
                return (
                  <mark key={idx} className="rounded bg-primary/30 px-0.5 py-0">
                    {visualizeWhitespace(part, whitespaceVisible)}
                  </mark>
                );
              }
              return <span key={idx}>{visualizeWhitespace(part, whitespaceVisible)}</span>;
            })}
          </span>
        );
      })}
      {text === '' && <span className="text-muted-foreground/50">∅</span>}
    </div>
  );
}

function splitBySearch(value: string, term: string) {
  if (!term) {
    return [value];
  }
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return value.split(regex).filter((segment) => segment.length > 0);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function visualizeWhitespace(value: string, enabled: boolean) {
  if (!enabled) {
    return value;
  }
  return value.replace(/ /g, '·').replace(/\t/g, '→    ');
}

function segmentClass(segmentType: string, rowType: DiffRow['type']) {
  if (segmentType === 'added') {
    return 'bg-emerald-500/20';
  }
  if (segmentType === 'removed') {
    return 'bg-red-500/20';
  }
  if (rowType === 'changed') {
    return 'bg-amber-500/15';
  }
  return undefined;
}

function makeRangeKey(range: CollapsibleRange) {
  return `${range.start}:${range.end}`;
}
