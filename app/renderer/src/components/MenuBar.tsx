import { Minus, Square, X } from 'lucide-react';

export function MenuBar() {
  const platform = window.localDiff?.platform ?? 'browser';
  const isMac = platform === 'darwin';

  const handleMinimize = () => {
    window.localDiff?.api?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.localDiff?.api?.maximizeWindow?.();
  };

  const handleClose = () => {
    window.localDiff?.api?.closeWindow?.();
  };

  return (
    <div className={`menu-bar app-drag-region ${isMac ? 'menu-bar-mac' : ''}`}>
      {!isMac && (
        <div className="menu-bar-controls app-no-drag">
          <button
            className="menu-bar-button menu-bar-button-close"
            onClick={handleClose}
            aria-label="Close window"
          >
            <X className="h-3 w-3" />
          </button>
          <button
            className="menu-bar-button menu-bar-button-maximize"
            onClick={handleMaximize}
            aria-label="Maximize window"
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            className="menu-bar-button menu-bar-button-minimize"
            onClick={handleMinimize}
            aria-label="Minimize window"
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="menu-bar-title">
        <span>Local Difference Checker</span>
      </div>
    </div>
  );
}

