import { ChangeEvent } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Preferences } from '@/types/preferences';
import { DiffGranularity, DiffViewMode } from '@/types/diff';

type SettingsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: Preferences;
  onUpdate: (partial: Partial<Preferences>) => void;
};

export function SettingsPanel({ open, onOpenChange, preferences, onUpdate }: SettingsPanelProps) {
  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ theme: event.target.value as Preferences['theme'] });
  };

  const handleGranularityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ diffGranularity: event.target.value as DiffGranularity });
  };

  const handleViewModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ viewMode: event.target.value as DiffViewMode });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-6 overflow-auto">
        <SheetHeader>
          <SheetTitle>Preferences</SheetTitle>
        </SheetHeader>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Appearance</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Theme</Label>
            <select id="theme" value={preferences.theme} onChange={handleThemeChange} className="rounded-md border bg-background px-3 py-2 text-sm">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size">Font size</Label>
            <Input
              id="font-size"
              type="number"
              value={preferences.fontSize}
              min={10}
              max={26}
              onChange={(event) => onUpdate({ fontSize: Number(event.target.value) })}
              className="w-24 text-right"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="font-family">Font family</Label>
            <Input id="font-family" value={preferences.fontFamily} onChange={(event) => onUpdate({ fontFamily: event.target.value })} />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Diff</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="granularity">Granularity</Label>
            <select
              id="granularity"
              value={preferences.diffGranularity}
              onChange={handleGranularityChange}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="line">Line</option>
              <option value="word">Word</option>
              <option value="char">Character</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="view-mode">View mode</Label>
            <select
              id="view-mode"
              value={preferences.viewMode}
              onChange={handleViewModeChange}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="split">Side by side</option>
              <option value="unified">Unified</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="collapse-threshold">Collapse after lines</Label>
            <Input
              id="collapse-threshold"
              type="number"
              value={preferences.collapseThreshold}
              min={4}
              max={200}
              onChange={(event) => onUpdate({ collapseThreshold: Number(event.target.value) })}
              className="w-24 text-right"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="json-formatting">JSON formatting</Label>
            <Switch id="json-formatting" checked={preferences.jsonFormatting} onCheckedChange={(checked) => onUpdate({ jsonFormatting: Boolean(checked) })} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="whitespace-sensitive">Whitespace sensitive</Label>
            <Switch id="whitespace-sensitive" checked={preferences.whitespaceSensitive} onCheckedChange={(checked) => onUpdate({ whitespaceSensitive: Boolean(checked) })} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="whitespace">Show whitespace markers</Label>
            <Switch id="whitespace" checked={preferences.whitespaceVisible} onCheckedChange={(checked) => onUpdate({ whitespaceVisible: Boolean(checked) })} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="scroll-sync">Scroll sync</Label>
            <Switch id="scroll-sync" checked={preferences.scrollSync} onCheckedChange={(checked) => onUpdate({ scrollSync: Boolean(checked) })} />
          </div>
        </section>
      </SheetContent>
    </Sheet>
  );
}
