export type ElectronFileResult = {
  content: string;
  fileName: string;
  extension: string;
};

export type ElectronApi = {
  openFile: () => Promise<ElectronFileResult | undefined>;
  exportFile: (payload: { data: string; defaultPath: string; filters: { name: string; extensions: string[] }[] }) => Promise<boolean>;
  getPreferences: () => Promise<any>;
  savePreferences: (payload: Record<string, unknown>) => Promise<any>;
  getVersion: () => Promise<string>;
  minimizeWindow?: () => Promise<void>;
  maximizeWindow?: () => Promise<void>;
  closeWindow?: () => Promise<void>;
};

declare global {
  interface Window {
    localDiff?: {
      api: ElectronApi;
      platform: NodeJS.Platform;
    };
    ClipboardItem?: typeof ClipboardItem;
  }
}
