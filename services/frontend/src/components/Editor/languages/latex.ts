import type { Monaco } from '@monaco-editor/react';

let initialized = false;

export function registerLatexLanguage(monaco: Monaco) {
  if (initialized) return;
  initialized = true;

  monaco.languages.register({
    id: 'latex'
  });

  monaco.languages.setMonarchTokensProvider('latex', {
    tokenizer: {
      root: [
        // comments
        [/%.*$/, 'comment'],

        // commands
        [/\\[a-zA-Z@]+/, 'keyword'],

        // environments
        [/\\begin(?=\{)/, 'keyword'],
        [/\\end(?=\{)/, 'keyword'],

        // braces
        [/[{}]/, 'delimiter'],

        // optional arguments
        [/\[[^\]]*\]/, 'attribute'],

        // inline math
        [/\$[^$]*\$/, 'string'],

        // numbers
        [/\d+/, 'number'],

        // operators
        [/[*+\-=]/, 'operator']
      ]
    }
  });
}
