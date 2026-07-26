import { useEffect, useRef, useState } from 'react';
import type { EditorStatus } from '@/types';
import type { docType } from '@cotex/types';
import { backendApi } from '@/services/backendApi';
import { config } from '@/config/env';
import { MessageType } from '@cotex/constants';
import * as Y from 'yjs';
import { useSocketStore } from '@/store/useSocketStore';

/**
 * A custom hook to fetch document data and establish a connection to the WebSocket server.
 *
 * @param docId - Document ID for which the connection is to be established
 * @param token - JWT token for authentication
 *
 * @returns Object containing editor status, connection error, document data, and shared YDoc
 */
export function useEstablishConnection(
  docId?: string,
  token?: string,
  setDocData?: (docData: docType) => void
) {
  const [editorStatus, setEditorStatus] = useState<EditorStatus>('loading-doc');
  const [connectionError, setConnectionError] = useState<
    'forbidden' | 'not-found' | null
  >(null);

  const ydocRef = useRef<Y.Doc | null>(null);

  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }

  const socketStore = useSocketStore();

  useEffect(() => {
    if (!docId || !token) {
      setConnectionError('not-found');
      setEditorStatus('error');
      return;
    }

    let cancelled = false;

    backendApi
      .getDoc({ token, docId })
      .then((res) => {
        if (cancelled) return;
        setDocData(res.data[0]);
        setEditorStatus('connecting');

        socketStore.connect({
          token,
          url: config.ws_server,
          docId
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setConnectionError(
          err.response?.status === 403 ? 'forbidden' : 'not-found'
        );
        setEditorStatus('error');
      });

    const unsubConnect = socketStore.onConnect(() => {
      setEditorStatus('syncing');

      const stateVector = Y.encodeStateVector(ydocRef.current!);

      socketStore.send({
        type: MessageType.SYNC_STEP1,
        docId,
        stateVector: Array.from(stateVector)
      });
    });

    const unsubMessage = socketStore.onMessage((msg: MessageEvent) => {
      const message = JSON.parse(msg.data);

      if (message.type === MessageType.SYNC_STEP2) {
        Y.applyUpdate(
          ydocRef.current!,
          new Uint8Array(message.update),
          'server-sync'
        );
        setEditorStatus('ready');
      }
    });

    return () => {
      cancelled = true;
      socketStore.disconnect();
      unsubConnect();
      unsubMessage();
    };
  }, [docId, token]);

  useEffect(() => {
    return () => {
      ydocRef.current?.destroy();
      ydocRef.current = null;
    };
  }, []);

  useEffect(() => {
    console.log('Editor status: ', editorStatus);
  }, [editorStatus]);

  return { editorStatus, connectionError, ydocRef };
}
