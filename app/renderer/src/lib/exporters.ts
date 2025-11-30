import { html as diffToHtml } from 'diff2html';
import diffStyle from 'diff2html/bundles/css/diff2html.min.css?raw';
import type { DiffRow } from '@/types/diff';

export function patchToPlainText(patch: string) {
  return patch;
}

export function patchToHtml(patch: string, theme: 'light' | 'dark' | 'system') {
  const html = diffToHtml(patch, {
    inputFormat: 'diff',
    matching: 'lines',
    drawFileList: false,
    outputFormat: 'side-by-side'
  });

  const background = theme === 'dark' ? '#020617' : '#ffffff';
  const text = theme === 'dark' ? '#f8fafc' : '#020617';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Diff Export</title>
    <style>
      body { background: ${background}; color: ${text}; font-family: "JetBrains Mono", SFMono-Regular, Menlo, monospace; }
      ${diffStyle}
    </style>
  </head>
  <body>
    ${html}
  </body>
</html>`;
}

export function rowsToText(rows: DiffRow[]) {
  return rows
    .map((row) => {
      const prefix =
        row.type === 'added' ? '+' : row.type === 'removed' ? '-' : row.type === 'changed' ? '±' : ' ';
      const left = row.leftText ?? '';
      const right = row.rightText ?? '';
      if (row.type === 'changed') {
        return `${prefix}${left}\n${prefix}${right}`;
      }
      return `${prefix}${left || right}`;
    })
    .join('\n');
}
