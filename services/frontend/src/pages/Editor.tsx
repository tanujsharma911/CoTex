import { useNavigate, useParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { toast } from 'sonner';
import type { docType, editingUser } from '@/types';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { PDFViewer } from '@/components/Editor/PDFviewer';
import { useDebouncedCallback } from 'use-debounce';
import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

import { useAuthStore } from '@/store/useAuthStore';
import { CodeEditor } from '../components/Editor';
import { backendApi } from '@/services/backendApi';
import { MessageType } from '@cotex/constants';
import { useSocketStore } from '@/store/useSocketStore';
import { downloadFile, generatePDF } from '@/lib/pdf';
import { Copy, Download, UserPlus } from 'lucide-react';
import { ButtonGroup } from '@/components/ui/button-group';
import { config } from '@/config/env';
import { ShowEditors } from '@/components/Editor/ShowEditors';
import { useMutation } from '@tanstack/react-query';
import ProjectSettingsDialog from '@/components/ProjectSettingsDialog';
import { useHandleUserPresence } from '@/hooks/useHandleUserPresence';

const Editor = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { token, user: currUser } = useAuthStore();
  const socketStore = useSocketStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const sharedDocRef = useRef<Y.Doc | null>(null);

  if (sharedDocRef.current == null) {
    sharedDocRef.current = new Y.Doc();
  }

  const [users, setUsers] = useState<editingUser[]>([]);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilationError, setCompilationError] = useState<string>('');
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [docData, setDocData] = useState<docType | undefined>(undefined);

  const fetchDocData = useMutation({
    mutationFn: () => {
      return backendApi
        .getDoc({ token, docId: docId })
        .then((res) => res.data[0]);
    },
    onSuccess: (data) => {
      setDocData(data);

      if (!token || !docId) {
        toast.error('Missing token or document ID');
        return;
      }

      socketStore.connect({
        token: token,
        url: config.ws_server,
        docId: docId
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      if (!error.response || error.response.status === 403) {
        toast.error("You don't have permission to access this document");
        navigate('/not-found');
        return;
      }
      console.error('Fetch document error:', error);
      toast.error('Failed to fetch document data');
      navigate('/not-found');
    }
  });

  const handleCompile = async () => {
    setCompilationError('');
    if (!token) return;
    if (!docId) return;

    setIsCompiling(true);

    try {
      const response = await backendApi.compileDoc({
        token,
        docId
      });

      const pdfBuffer = response.data.pdf.data;

      setPdfBuffer(pdfBuffer);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to compile PDF';
      const errorDetails = error.response?.data?.error;

      setCompilationError(errorDetails);
      toast.error(errorMessage);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!token) return;
    if (!docId) return;

    try {
      const response = await backendApi.compileDoc({
        token,
        docId
      });

      const pdfBuffer = response.data.pdf.data;

      const uint8Array = new Uint8Array(pdfBuffer);

      const url = generatePDF(uint8Array);

      if (!url) {
        toast.error('Failed to generate PDF URL');
        return;
      }

      downloadFile(url, `${docData?.name || 'document'}.pdf`);
    } catch (error) {
      console.log('Download PDF error:', error);
      toast.error('Failed to download PDF');
    }
  };

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

  /* ------------------------ Setting up Socket Connection ------------------------ */
  useEffect(() => {
    const doc = sharedDocRef.current;

    if (!docId) {
      navigate('/not-found');
      return;
    }

    if (!doc) {
      toast.error('Failed to initialize document');
      navigate('/not-found');
      return;
    }

    if (!token) {
      toast.error('You must be logged in to access the editor');
      navigate('/login');
      return;
    }

    fetchDocData.mutate(); // Fetch document data and connect to socket

    return () => {
      doc?.destroy();
      socketStore.disconnect();
    };
  }, []);

  /* ------------------------ Handling Socket Events ------------------------ */
  useEffect(() => {
    if (!socketStore.socket) return;

    /* ------------------------ Receving Messages ------------------------ */
    socketStore.socket.addEventListener(
      'message',
      (event: { data: string }) => {
        if (!sharedDocRef.current) return;

        const message = JSON.parse(event.data);

        console.log('V Received message ::', message.type, '::', message);

        switch (message.type) {
          case MessageType.EDIT:
            Y.applyUpdate(
              sharedDocRef.current,
              new Uint8Array(Object.values(message.update)),
              'remote'
            );
            break;
          case MessageType.DOC_UPDATE:
            Y.applyUpdate(
              sharedDocRef.current,
              new Uint8Array(message.update.data),
              'server-sync'
            );
            break;
          case MessageType.EDITORS_UPDATE:
            setUsers(message.data);
            break;
          case MessageType.CURSOR_MOVE:
            setUsers((prev) => {
              const tempUsers = [...prev];

              const userIndex = tempUsers.findIndex(
                (user) => user.userId === message.data.userId
              );

              if (userIndex === -1) {
                console.log('Received cursor move for unknown user, ignoring');
                return tempUsers;
              }

              tempUsers[userIndex] = {
                ...message.data
              };

              return tempUsers;
            });
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      }
    );

    /* ------------------------ Sending Edit Messages ------------------------ */
    sharedDocRef.current?.on(
      'update',
      (update: Uint8Array, origin: string | null) => {
        if (origin === 'server-sync' || origin === 'remote') {
          return; // Don't send server-originated or remote updates back
        }

        console.log('^ Sending edit update');
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
    users,
    currUser
  });

  if (!docId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-screen grid grid-rows-[auto_1fr]">
      {/* Menu bar */}
      <section className="h-12 px-4 pb-0 grid grid-cols-3 items-center">
        <div className="flex items-center gap-3">
          <h1 className="font-medium truncate overflow-hidden text-ellipsis">
            {docData?.name || 'Undefined'}
          </h1>
          <p className="flex items-center gap-2 text-sm">
            <span
              className={`${socketStore.isConnected ? 'bg-lime-400' : 'bg-rose-400'} w-3 h-3 rounded-full`}
            ></span>
            {socketStore.isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <ButtonGroup>
            <Button
              className="cursor-pointer"
              onClick={handleCompile}
              disabled={isCompiling}
              variant={'outline'}
            >
              {isCompiling && <Spinner data-icon="inline-start" />}
              {isCompiling ? 'Generating...' : 'Generate PDF'}
            </Button>
            <Button onClick={handleDownloadPDF} variant={'outline'}>
              <Download />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <ProjectSettingsDialog
              docData={docData}
              fetchDocData={fetchDocData}
            />
          </ButtonGroup>
        </div>

        <div className="flex justify-end gap-2">
          <ShowEditors users={users} />

          <Dialog>
            <DialogTrigger
              variant={'ghost'}
              className="hover:bg-zinc-100 hover:dark:bg-zinc-800 px-2 rounded-lg"
            >
              <UserPlus className="size-4" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Collaborator</DialogTitle>
                <DialogDescription className="grid grid-cols-1">
                  Share this document with others by sending them the link. They
                  will be able to edit the document in real-time. But make sure
                  visibility is set to public.
                  <p className="mt-5">Share Link</p>
                  <div className="grid grid-cols-[auto_1fr] gap-2 mt-2 items-center">
                    <code className="relative rounded overflow-scroll scroll bg-muted px-[0.3rem] font-mono text-base h-fit font-semibold">
                      {window.location.href}
                    </code>
                    <Button
                      variant={'outline'}
                      onClick={() =>
                        navigator.clipboard.writeText(window.location.href)
                      }
                    >
                      <Copy />
                    </Button>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <ResizablePanelGroup
        orientation="horizontal"
        className="max-w-screen w-full gap-1 p-2 pt-0"
      >
        <ResizablePanel defaultSize="50%">
          <div className="h-full rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
            <CodeEditor
              sharedDocRef={sharedDocRef}
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
            <PDFViewer buffer={pdfBuffer} error={compilationError} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Editor;
