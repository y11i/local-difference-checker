import { DiffGranularity, DiffViewMode } from './diff';

export type Preferences = {
  theme: 'light' | 'dark' | 'system';
  diffGranularity: DiffGranularity;
  viewMode: DiffViewMode;
  whitespaceSensitive: boolean;
  whitespaceVisible: boolean;
  jsonFormatting: boolean;
  scrollSync: boolean;
  fontSize: number;
  fontFamily: string;
  collapseThreshold: number;
};
