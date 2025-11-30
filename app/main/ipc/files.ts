import { dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

type OpenDialogResult = {
  content: string;
  fileName: string;
  extension: string;
};

type ExportPayload = {
  data: string;
  defaultPath: string;
  filters: Array<{ name: string; extensions: string[] }>;
};

export function registerFileHandlers() {
  ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Text', extensions: ['txt', 'text'] },
        { name: 'JSON', extensions: ['json'] },
        { name: 'Code', extensions: ['js', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return undefined;
    }

    const filePath = result.filePaths[0];
    const buffer = await fs.readFile(filePath);
    const extension = path.extname(filePath).replace('.', '').toLowerCase();

    const payload: OpenDialogResult = {
      content: buffer.toString('utf-8'),
      fileName: path.basename(filePath),
      extension
    };

    return payload;
  });

  ipcMain.handle('file:export', async (_, payload: ExportPayload) => {
    const result = await dialog.showSaveDialog({
      defaultPath: payload.defaultPath,
      filters: payload.filters
    });

    if (result.canceled || !result.filePath) {
      return false;
    }

    await fs.writeFile(result.filePath, payload.data, 'utf-8');
    return true;
  });
}
