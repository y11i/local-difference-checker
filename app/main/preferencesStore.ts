import Store from 'electron-store';

export type Preferences = {
  theme: 'light' | 'dark' | 'system';
  diffGranularity: 'line' | 'word' | 'char';
  viewMode: 'split' | 'unified';
  whitespaceSensitive: boolean;
  whitespaceVisible: boolean;
  jsonFormatting: boolean;
  scrollSync: boolean;
  fontSize: number;
  fontFamily: string;
  collapseThreshold: number;
};

const store = new Store<Preferences>({
  name: 'preferences',
  defaults: {
    theme: 'system',
    diffGranularity: 'line',
    viewMode: 'split',
    whitespaceSensitive: true,
    whitespaceVisible: false,
    jsonFormatting: true,
    scrollSync: true,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, SFMono-Regular, Menlo, monospace',
    collapseThreshold: 12
  }
});

export function getPreferences(): Preferences {
  return store.store;
}

export function updatePreferences(partial: Partial<Preferences>): Preferences {
  store.set(partial);
  return store.store;
}
