import { useCallback, useState } from 'react';

export function useHistoryState(initialValue: string) {
  const [history, setHistory] = useState([initialValue]);
  const [position, setPosition] = useState(0);
  const value = history[position];

  const setValue = useCallback(
    (next: string) => {
      if (next === value) {
        return;
      }
      const newHistory = history.slice(0, position + 1);
      newHistory.push(next);
      setHistory(newHistory);
      setPosition(newHistory.length - 1);
    },
    [history, position, value]
  );

  const undo = useCallback(() => {
    setPosition((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setPosition((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  return {
    value,
    setValue,
    undo,
    redo,
    canUndo: position > 0,
    canRedo: position < history.length - 1
  };
}
