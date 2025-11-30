import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, FileText, Settings, SkipBack, SkipForward } from 'lucide-react';
import { InputPane } from '@/components/InputPane';
import { DiffViewer } from '@/components/DiffViewer';
import { useHistoryState } from '@/hooks/useHistoryState';
import { useDiffWorker } from '@/hooks/useDiffWorker';
import { usePreferences } from '@/hooks/usePreferences';
import { useScrollSync } from '@/hooks/useScrollSync';
import { SettingsPanel } from '@/components/SettingsPanel';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { DiffStatsSummary } from '@/components/DiffStats';
import { MenuBar } from '@/components/MenuBar';
import { patchToPlainText, patchToHtml } from '@/lib/exporters';
import type { CollapsibleRange, DiffGranularity, DiffViewMode } from '@/types/diff';

type FileMeta = {
  fileName?: string;
  extension?: string;
};

const buildRangeKey = (range: Pick<CollapsibleRange, 'start' | 'end'>) => `${range.start}:${range.end}`;

export default function App() {
  const leftHistory = useHistoryState('');
  const rightHistory = useHistoryState('');
  const [leftMeta, setLeftMeta] = useState<FileMeta>({});
  const [rightMeta, setRightMeta] = useState<FileMeta>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [jsonMode, setJsonMode] = useState(false);
  const [expandedRanges, setExpandedRanges] = useState<Set<string>>(new Set());
  const [highlightedBlock, setHighlightedBlock] = useState<number | null>(null);
  const blockRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const { result, isComputing, error, runDiff } = useDiffWorker();
  const { preferences, updatePreferences, isLoading } = usePreferences();
  const { registerPane, handleScroll } = useScrollSync(preferences.scrollSync);

  const [searchPointer, setSearchPointer] = useState(0);

  useEffect(() => {
    const platform = window.localDiff?.platform ?? 'browser';
    document.documentElement.dataset.platform = platform;
  }, []);

  useEffect(() => {
    setJsonMode(preferences.jsonFormatting);
  }, [preferences.jsonFormatting]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      runDiff(leftHistory.value || '', rightHistory.value || '', {
        granularity: preferences.diffGranularity,
        jsonMode,
        whitespaceSensitive: preferences.whitespaceSensitive,
        collapseThreshold: preferences.collapseThreshold
      });
    }, 150);

    return () => clearTimeout(timeout);
  }, [leftHistory.value, rightHistory.value, preferences.diffGranularity, preferences.whitespaceSensitive, preferences.collapseThreshold, jsonMode, runDiff]);

  useEffect(() => {
    setExpandedRanges(new Set());
    blockRefs.current.clear();
    setHighlightedBlock(null);
  }, [result?.rows]);

  const rows = result?.rows ?? [];
  const collapsibleRanges = result?.collapsible ?? [];
  const blockCount = result?.blocks.length ?? 0;

  const ensureRowVisible = useCallback(
    (rowIndex: number) => {
      let expanded = false;
      for (const range of collapsibleRanges) {
        if (rowIndex >= range.start && rowIndex <= range.end) {
          const key = buildRangeKey(range);
          setExpandedRanges((prev) => {
            if (prev.has(key)) {
              return prev;
            }
            expanded = true;
            const next = new Set(prev);
            next.add(key);
            return next;
          });
          break;
        }
      }
      return expanded;
    },
    [collapsibleRanges]
  );

  const searchMatches = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    const lower = searchTerm.toLowerCase();
    const indexes: number[] = [];
    rows.forEach((row, index) => {
      const content = `${row.leftText ?? ''}\n${row.rightText ?? ''}`.toLowerCase();
      if (content.includes(lower)) {
        indexes.push(index);
      }
    });
    return indexes;
  }, [rows, searchTerm]);

  useEffect(() => {
    setSearchPointer(0);
  }, [searchMatches.length]);

  const scrollToRow = useCallback(
    (rowIndex: number) => {
      const expanded = ensureRowVisible(rowIndex);
      const scroll = () => {
        const element = document.querySelector<HTMLElement>(`[data-row-index="${rowIndex}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      if (expanded) {
        setTimeout(scroll, 160);
      } else {
        scroll();
      }
    },
    [ensureRowVisible]
  );

  const selectSearchMatch = useCallback(
    (direction: 1 | -1) => {
      if (!searchMatches.length) {
        return;
      }
      setSearchPointer((prev) => {
        const next = (prev + direction + searchMatches.length) % searchMatches.length;
        scrollToRow(searchMatches[next]);
        return next;
      });
    },
    [scrollToRow, searchMatches]
  );

  const toggleRange = useCallback((key: string) => {
    setExpandedRanges((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const registerBlockRef = useCallback((index: number, element: HTMLDivElement | null) => {
    if (element) {
      blockRefs.current.set(index, element);
    } else {
      blockRefs.current.delete(index);
    }
  }, []);

  const focusBlock = useCallback(
    (direction: 1 | -1) => {
      if (!result || blockCount === 0) {
        return;
      }
      setHighlightedBlock((prev) => {
        let next = 0;
        if (prev === null) {
          next = direction > 0 ? 0 : blockCount - 1;
        } else {
          next = Math.min(blockCount - 1, Math.max(0, prev + direction));
        }
        const node = blockRefs.current.get(next);
        if (node) {
          node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return next;
      });
    },
    [blockCount, result]
  );

  const handleCopy = useCallback(
    async (format: 'text' | 'html') => {
      if (!result) {
        return;
      }
      try {
        if (format === 'text') {
          await navigator.clipboard.writeText(patchToPlainText(result.patch));
        } else {
          const html = patchToHtml(result.patch, preferences.theme);
          if (navigator.clipboard && 'write' in navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
            await navigator.clipboard.write([
              new window.ClipboardItem({
                'text/html': new Blob([html], { type: 'text/html' })
              })
            ]);
          } else {
            await navigator.clipboard.writeText(html);
          }
        }
      } catch (error) {
        console.error('Copy failed', error);
      }
    },
    [preferences.theme, result]
  );

  const handleExport = useCallback(
    async (format: 'txt' | 'html') => {
      if (!result || !window.localDiff?.api) {
        return;
      }
      const defaultPath = `diff-${Date.now()}.${format}`;
      const data = format === 'txt' ? patchToPlainText(result.patch) : patchToHtml(result.patch, preferences.theme);
      await window.localDiff.api.exportFile({
        data,
        defaultPath,
        filters: [{ name: format === 'txt' ? 'Text' : 'HTML', extensions: [format] }]
      });
    },
    [preferences.theme, result]
  );

  const handleFilePayload = useCallback(
    (side: 'left' | 'right', payload: { content: string; fileName: string; extension: string }) => {
      if (side === 'left') {
        leftHistory.setValue(payload.content);
        setLeftMeta({ fileName: payload.fileName, extension: payload.extension });
      } else {
        rightHistory.setValue(payload.content);
        setRightMeta({ fileName: payload.fileName, extension: payload.extension });
      }
      if (payload.extension.toLowerCase() === 'json' && preferences.jsonFormatting) {
        setJsonMode(true);
      }
    },
    [leftHistory, preferences.jsonFormatting, rightHistory]
  );

  const handleOpenFile = useCallback(
    async (side: 'left' | 'right') => {
      if (!window.localDiff?.api) {
        return;
      }
      const payload = await window.localDiff.api.openFile();
      if (payload) {
        handleFilePayload(side, payload);
      }
    },
    [handleFilePayload]
  );

  const handleDrop = useCallback(
    async (side: 'left' | 'right', file: File) => {
      try {
        const text = await file.text();
        handleFilePayload(side, { content: text, fileName: file.name, extension: file.name.split('.').pop() || '' });
      } catch (error) {
        console.error('Unable to read file', error);
      }
    },
    [handleFilePayload]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault();
        focusBlock(1);
      }
      if (event.altKey && event.key === 'ArrowUp') {
        event.preventDefault();
        focusBlock(-1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusBlock]);

  const jsonModeHint = jsonMode ? 'JSON diff mode (order-insensitive)' : 'Plain text diff';

  return (
    <>
      <MenuBar />
      <div className="app-shell flex flex-col gap-4 bg-background px-4 pb-4">
        <header className="flex flex-col gap-4 rounded-2xl border bg-card px-6 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="app-no-drag">
            <h1 className="text-2xl font-bold">Local Difference Checker</h1>
            <p className="text-sm text-muted-foreground">Offline-first diff analyzer with JSON awareness</p>
          </div>
          <div className="app-no-drag flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleCopy('text')} disabled={!result}>
              <Copy className="mr-1 h-4 w-4" />
              Copy Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleCopy('html')} disabled={!result}>
              <Copy className="mr-1 h-4 w-4" />
              Copy HTML
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('txt')} disabled={!result}>
              <FileText className="mr-1 h-4 w-4" />
              Export .txt
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('html')} disabled={!result}>
              <Download className="mr-1 h-4 w-4" />
              Export .html
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setJsonMode((prev) => !prev)}>
              {jsonMode ? 'JSON Mode' : 'Text Mode'}
            </Button>
            <Button variant="default" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="mr-1 h-4 w-4" />
              Settings
            </Button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <InputPane
            label="Input A"
            value={leftHistory.value}
            placeholder="Paste or type original content..."
            fileName={leftMeta.fileName}
            onChange={leftHistory.setValue}
            onClear={() => leftHistory.setValue('')}
            onOpenFile={() => handleOpenFile('left')}
            onFileDrop={(file) => handleDrop('left', file)}
            fontSize={preferences.fontSize}
            fontFamily={preferences.fontFamily}
            canUndo={leftHistory.canUndo}
            canRedo={leftHistory.canRedo}
            undo={leftHistory.undo}
            redo={leftHistory.redo}
            textAreaRef={registerPane(0)}
            onScroll={handleScroll(0)}
          />
          <InputPane
            label="Input B"
            value={rightHistory.value}
            placeholder="Paste or type comparison content..."
            fileName={rightMeta.fileName}
            onChange={rightHistory.setValue}
            onClear={() => rightHistory.setValue('')}
            onOpenFile={() => handleOpenFile('right')}
            onFileDrop={(file) => handleDrop('right', file)}
            fontSize={preferences.fontSize}
            fontFamily={preferences.fontFamily}
            canUndo={rightHistory.canUndo}
            canRedo={rightHistory.canRedo}
            undo={rightHistory.undo}
            redo={rightHistory.redo}
            textAreaRef={registerPane(1)}
            onScroll={handleScroll(1)}
          />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => focusBlock(-1)} disabled={!result || blockCount === 0}>
                <SkipBack className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button variant="ghost" size="sm" onClick={() => focusBlock(1)} disabled={!result || blockCount === 0}>
                Next
                <SkipForward className="ml-1 h-4 w-4" />
              </Button>
              <div className="text-xs text-muted-foreground">
                {blockCount > 0 ? `Change ${Math.min((highlightedBlock ?? 0) + 1, blockCount)} of ${blockCount}` : 'No changes'}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground">View</label>
                <select value={preferences.viewMode} onChange={(event) => updatePreferences({ viewMode: event.target.value as DiffViewMode })} className="rounded-md border bg-background px-2 py-1 text-xs">
                  <option value="split">Split</option>
                  <option value="unified">Unified</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Granularity</label>
                <select
                  value={preferences.diffGranularity}
                  onChange={(event) => updatePreferences({ diffGranularity: event.target.value as DiffGranularity })}
                  className="rounded-md border bg-background px-2 py-1 text-xs"
                >
                  <option value="line">Line</option>
                  <option value="word">Word</option>
                  <option value="char">Char</option>
                </select>
              </div>
              <span className="text-xs text-muted-foreground">{jsonModeHint}</span>
            </div>
            <DiffStatsSummary stats={result?.stats ?? null} />
          </div>

          <SearchBar value={searchTerm} onChange={setSearchTerm} onClear={() => setSearchTerm('')} onFindNext={() => selectSearchMatch(1)} onFindPrevious={() => selectSearchMatch(-1)} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{isComputing ? 'Computing diff…' : rows.length ? `${rows.length} lines analyzed` : 'Awaiting input'}</span>
            {error && <span className="text-destructive">Diff error: {error}</span>}
            <span>{searchMatches.length > 0 ? `Match ${searchPointer + 1} of ${searchMatches.length}` : searchTerm ? 'No matches' : ''}</span>
          </div>

          <DiffViewer
            rows={rows}
            viewMode={preferences.viewMode}
            whitespaceVisible={preferences.whitespaceVisible}
            searchTerm={searchTerm}
            highlightedBlock={highlightedBlock}
            expandedRanges={expandedRanges}
            collapsible={collapsibleRanges}
            onToggleRange={toggleRange}
            registerBlockRef={registerBlockRef}
            fontSize={preferences.fontSize}
            fontFamily={preferences.fontFamily}
          />
        </section>

        <SettingsPanel open={isSettingsOpen} onOpenChange={setIsSettingsOpen} preferences={preferences} onUpdate={updatePreferences} />
      </div>
    </>
  );
}
