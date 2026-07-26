import { useParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import { PDFViewer } from '@/components/Editor/PDFviewer';
import { useDebouncedCallback } from 'use-debounce';
import type { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

import { useAuthStore } from '@/store/useAuthStore';
import { CodeEditor } from '../components/Editor';
import { backendApi } from '@/services/backendApi';
import { MessageType } from '@cotex/constants';
import { useMutation } from '@tanstack/react-query';
import { useHandleUserPresence } from '@/hooks/useHandleUserPresence';
import MenuBar from '@/components/Editor/MenuBar';
import type { docType, editingUser } from '@cotex/types';
import { useEstablishConnection } from '@/hooks/useEstablishConnection';
import { useSocketStore } from '@/store/useSocketStore';
import SideBar from '@/components/Editor/SideBar';

const Editor = () => {
  const { docId } = useParams();

  const [docData, setDocData] = useState<docType | null>(null);
  const [editors, setEditors] = useState<editingUser[]>([]);
  const [compilationError, setCompilationError] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const { token, user: currUser } = useAuthStore();
  const { editorStatus, connectionError, ydocRef } = useEstablishConnection(
    docId,
    token,
    setDocData
  );
  const socketStore = useSocketStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const compileCode = useMutation({
    mutationFn: async () => {
      const response = await backendApi.compileDoc({
        token,
        docId
      });

      return response;
    },
    onSuccess: (data) => {
      setPdfUrl(data.pdfUrl);
    },
    onError: (error) => {
      console.error('Compile Code ::', error);
      //TODO: Proper error handling
    }
  });

  const fetchDocData = useMutation({
    mutationFn: async () => {
      const response = await backendApi.getDoc({
        token,
        docId
      });

      return response;
    },
    onSuccess: (data) => {
      console.log('Fetch Doc Data ::', data);
    },
    onError: (error) => {
      console.error('Fetch Doc Data ::', error);
      //TODO: Proper error handling
    }
  });

  const downloadPDF = useMutation({
    mutationFn: async () => {
      const response = await backendApi.compileDoc({
        token,
        docId
      });

      return response;
    },
    onSuccess: (data) => {
      console.log('Download PDF ::', data);
      // downloadFile(url, `${docData?.name || 'document'}.pdf`);
    },
    onError: (error) => {
      console.error('Download PDF ::', error);
      //TODO: Proper error handling
    }
  });

  const handleWhenCursorMoves = useDebouncedCallback(
    (cursorDetails: editingUser['selection']) => {
      if (!socketStore.socket) return;

      const message = {
        type: MessageType.CURSOR_MOVE,
        data: cursorDetails
      };

      socketStore.socket.send(JSON.stringify(message));
    },
    300
  );

  /* ------------------------ Handling Socket Events ------------------------ */
  useEffect(() => {
    if (!socketStore.socket) return;

    /* ------------------------ Sending Edit Messages ------------------------ */
    ydocRef.current?.on(
      'update',
      (update: Uint8Array, origin: string | null) => {
        if (origin === 'server-sync') {
          return; // Don't send server-originated updates back
        }

        console.log('⬆ Sending edit update');
        socketStore.socket?.send(
          JSON.stringify({ type: MessageType.EDIT, update })
        );
      }
    );
  }, [socketStore.socket]);

  /* ------------------------ Updating Remote User Cursors in Monaco ------------------------ */
  useHandleUserPresence({
    editorRef,
    monacoRef,
    editors,
    currUser
  });

  if (editorStatus === 'loading-doc') {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-screen grid grid-rows-[auto_1fr]">
      {/* Menu bar */}
      <MenuBar
        editors={editors}
        docData={docData}
        fetchDocData={fetchDocData}
        compileCode={compileCode}
        downloadPDF={downloadPDF}
      />

      <SideBar.Provider>
        <ResizablePanelGroup
          orientation="horizontal"
          className="max-w-screen w-full gap-1 p-2 pt-0 pl-0"
        >
          <ResizablePanel defaultSize="50%">
            <div className="h-full rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
              <CodeEditor
                ydocRef={ydocRef}
                ref={editorRef}
                monacoRef={monacoRef}
                onCursorMove={handleWhenCursorMoves}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="hover:bg-blue-500 bg-transparent"
          />

          <ResizablePanel defaultSize="50%">
            <div className="h-full rounded-lg overflow-hidden grid grid-rows-1 bg-gray-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-white">
              <PDFViewer pdfUrl={pdfUrl} error={compilationError} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SideBar.Provider>
    </div>
  );
};

export default Editor;
