import type { Monaco } from '@monaco-editor/react';

let initialized = false;

export function registerLatexTheme(monaco: Monaco) {
  if (initialized) return;
  initialized = true;

  monaco.editor.defineTheme('latex-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '569CD6' },
      { token: 'comment', foreground: '6A9955' },
      { token: 'attribute', foreground: 'DCDCAA' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' }
    ],
    colors: {}
  });
}
