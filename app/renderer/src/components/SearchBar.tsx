import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
};

export function SearchBar({ value, onChange, onClear, onFindNext, onFindPrevious }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Find in diff..." className="border-none shadow-none focus-visible:ring-0" />
      {value && (
        <Button variant="ghost" size="icon" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onFindPrevious}>
        Prev
      </Button>
      <Button variant="ghost" size="sm" onClick={onFindNext}>
        Next
      </Button>
    </div>
  );
}
