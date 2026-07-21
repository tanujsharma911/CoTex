import type { Monaco } from '@monaco-editor/react';
import { registerLatexLanguage } from './languages/latex';
import { registerLatexTheme } from './languages/latex.theme';

let initialized = false;

export function setupMonaco(monaco: Monaco) {
  if (initialized) return;
  initialized = true;

  registerLatexLanguage(monaco);
  registerLatexTheme(monaco);
}
