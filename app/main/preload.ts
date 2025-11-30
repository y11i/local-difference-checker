import { contextBridge, ipcRenderer } from 'electron';

const api = {
  openFile: () => ipcRenderer.invoke('file:open'),
  exportFile: (payload: { data: string; defaultPath: string; filters: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('file:export', payload),
  getPreferences: () => ipcRenderer.invoke('preferences:get'),
  savePreferences: (payload: Record<string, unknown>) => ipcRenderer.invoke('preferences:set', payload),
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close')
};

contextBridge.exposeInMainWorld('localDiff', {
  api,
  platform: process.platform
});

declare global {
  interface Window {
    localDiff: {
      api: typeof api;
      platform: NodeJS.Platform;
    };
  }
}
