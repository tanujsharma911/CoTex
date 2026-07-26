import React, { useEffect, useRef } from 'react';
import { injectCursorStyleOnlyOneTime } from '@/lib/editor.utils';
import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type { AuthUser } from '@/types';
import type { editingUser } from '@cotex/types';

export const useHandleUserPresence = ({
  editorRef,
  monacoRef,
  editors,
  currUser
}: {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  monacoRef: React.RefObject<Monaco | null>;
  editors: editingUser[];
  currUser: AuthUser | undefined;
}) => {
  const decorationIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const remoteUsers = editors.filter((user) => user.userId !== currUser?._id);

    const newDecorations = remoteUsers
      .filter(
        (user) =>
          user.selection &&
          user.selection.head?.lineNumber &&
          user.selection.head.column
      )
      .map((user) => {
        const color = '#3b82f6';

        const styleClass = injectCursorStyleOnlyOneTime(
          user.userId,
          user.name,
          color
        );

        return {
          range: new monacoRef.current!.Range(
            user.selection?.head?.lineNumber,
            user.selection?.head?.column,
            user.selection?.head?.lineNumber,
            user.selection?.head?.column
          ),
          options: {
            className: styleClass,
            stickiness:
              monacoRef.current!.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges
          }
        };
      });

    // 3. Apply the decorations to Monaco (this automatically removes the old ones tracked by decorationIdsRef)
    decorationIdsRef.current = editorRef.current.deltaDecorations(
      decorationIdsRef.current,
      newDecorations
    );
  }, [editors, currUser]);
};
