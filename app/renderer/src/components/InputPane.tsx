import React, { useCallback } from 'react';
import { Upload, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type InputPaneProps = {
  label: string;
  value: string;
  placeholder?: string;
  fileName?: string;
  onChange: (value: string) => void;
  onOpenFile: () => void;
  onClear: () => void;
  onFileDrop: (file: File) => void;
  fontSize: number;
  fontFamily: string;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  textAreaRef?: React.Ref<HTMLTextAreaElement>;
  onScroll?: (event: React.UIEvent<HTMLTextAreaElement>) => void;
};

export function InputPane({
  label,
  value,
  placeholder,
  fileName,
  onChange,
  onOpenFile,
  onClear,
  onFileDrop,
  fontSize,
  fontFamily,
  canUndo,
  canRedo,
  undo,
  redo,
  textAreaRef,
  onScroll
}: InputPaneProps) {
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        onFileDrop(file);
      }
    },
    [onFileDrop]
  );

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card/50 p-4">
      <div className="flex items-center justify-between text-sm">
        <div className="font-semibold">{label}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {fileName ? <span className="truncate max-w-[220px]">{fileName}</span> : <span>No file loaded</span>}
          <Button variant="ghost" size="sm" onClick={onOpenFile} className="gap-1">
            <Upload className="h-4 w-4" />
            Load
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
      <div
        className="relative flex flex-1 flex-col rounded-md border border-dashed border-muted-foreground/50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn('min-h-[240px] flex-1 resize-none border-none bg-transparent', 'font-mono')}
          style={{ fontSize, fontFamily }}
          ref={textAreaRef}
          onScroll={onScroll}
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Button variant="secondary" size="icon" onClick={undo} disabled={!canUndo} title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={redo} disabled={!canRedo} title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-md border border-dashed border-transparent transition-colors data-[dragging=true]:border-primary" />
        {!value && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center text-xs text-muted-foreground">
            Drag &amp; drop files (.txt, .json, code) here
          </div>
        )}
      </div>
    </div>
  );
}
