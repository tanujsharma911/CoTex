import { useRef, useEffect } from 'react';

import Editor, { type Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { useAuthStore } from '@/store/useAuthStore';
import type { editingUser } from '@/types';
import { useThemeStore } from '@/store/useThemeStore';
import { setupMonaco } from './setup';

export function CodeEditor({
  sharedDocRef,
  ref,
  monacoRef,
  onCursorMove
}: {
  sharedDocRef: React.RefObject<Y.Doc | null>;
  ref: React.RefObject<editor.IStandaloneCodeEditor | null>;
  monacoRef: React.RefObject<typeof editor | null>;
  onCursorMove: (cursorDetails: editingUser['selection']) => void;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  const bindingRef = useRef<MonacoBinding | null>(null);

  const handleOnMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    if (!user?.name) {
      return;
    }
    ref.current = editor;
    monacoRef.current = monaco;

    const editorModel = editor.getModel();

    editor.onDidChangeCursorSelection(
      (e: editor.ICursorSelectionChangedEvent) => {
        const cursorDetails = {
          selection: {
            anchor: {
              lineNumber: e.selection.selectionStartLineNumber,
              column: e.selection.selectionStartColumn
            },
            head: {
              lineNumber: e.selection.positionLineNumber,
              column: e.selection.positionColumn
            }
          }
        };

        onCursorMove(cursorDetails.selection);
      }
    );

    if (!editorModel) {
      console.log('CollaborativeEditor :: editor model is null');
      return;
    }
    if (!sharedDocRef.current) {
      console.log('CollaborativeEditor :: sharedDocRef is null');
      return;
    }

    const sharedLatexCode = sharedDocRef.current.getText('sharedLatexCode');

    // Bind Yjs to Monaco
    bindingRef.current = new MonacoBinding(
      sharedLatexCode,
      editorModel,
      new Set([editor])
    );
  };

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Editor
      beforeMount={setupMonaco}
      defaultLanguage="latex"
      theme={`vs-${theme}`}
      onMount={handleOnMount}
      options={{
        renderValidationDecorations: 'off'
      }}
    />
  );
}
