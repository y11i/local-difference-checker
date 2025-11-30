import { useCallback, useEffect, useState } from 'react';
import type { Preferences } from '@/types/preferences';

const defaultPreferences: Preferences = {
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
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (window.localDiff?.api) {
          const prefs = await window.localDiff.api.getPreferences();
          if (mounted && prefs) {
            setPreferences(prefs);
            applyTheme(prefs.theme);
          }
        }
      } catch (error) {
        console.error('Failed to load preferences', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (preferences.theme !== 'system') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [preferences.theme]);

  const persistPreferences = useCallback(async (partial: Partial<Preferences>) => {
    try {
      if (window.localDiff?.api) {
        await window.localDiff.api.savePreferences(partial);
      }
    } catch (error) {
      console.error('Failed to persist preferences', error);
    }
  }, []);

  const updatePreferences = useCallback(
    (partial: Partial<Preferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...partial };
        applyTheme(next.theme);
        persistPreferences(partial);
        return next;
      });
    },
    [persistPreferences]
  );

  return { preferences, isLoading, updatePreferences };
}

function applyTheme(theme: Preferences['theme']) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
