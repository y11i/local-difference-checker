import { ipcMain, nativeTheme } from 'electron';
import { getPreferences, updatePreferences } from '../preferencesStore.js';

export function registerPreferencesHandlers() {
  ipcMain.handle('preferences:get', () => {
    return getPreferences();
  });

  ipcMain.handle('preferences:set', (_, payload: Partial<ReturnType<typeof getPreferences>>) => {
    const updated = updatePreferences(payload);
    nativeTheme.themeSource = updated.theme;
    return updated;
  });
}
