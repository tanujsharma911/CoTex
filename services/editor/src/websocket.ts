import http from 'http';
import * as Y from 'yjs';
import debounce from 'debounce';

import { docManager } from './DocManager.js';
import { userManager } from './UserManager.js';
import { REDIS_CHANNEL_DOC } from './config/constants.js';
import { MessageType } from '@cotex/constants';

import { UserRepository } from './repositories/user.repository.js';
import { DocsRepository } from './repositories/docs.repository.js';
import { getChannelKey, validateRequest } from './utils/utils.js';
import { Docs } from './models/docs.model.js';
import { randomUUID } from 'crypto';
import WebSocket from 'ws';
import type { MessageEvent } from 'ws';
import { pubClient, subClient } from './redis.client.js';
import { storage } from './storage.js';

const SERVER_ID = randomUUID();

const toMessageText = (data: unknown): string | null => {
  if (typeof data === 'string') {
    return data;
  }

  if (data instanceof Buffer) {
    return data.toString('utf-8');
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString('utf-8');
  }

  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString(
      'utf-8'
    );
  }

  return null;
};

class WSConnection {
  readonly userRepository: UserRepository = new UserRepository();
  readonly docRepository: DocsRepository = new DocsRepository();

  constructor() {
    this.initRedisSubscriber();
  }

  private initRedisSubscriber() {
    subClient.on('message', async (channel: string, message: string) => {
      if (!channel.startsWith(REDIS_CHANNEL_DOC)) return;

      const docId = channel.replace(`${REDIS_CHANNEL_DOC}:`, '');

      try {
        const payload = JSON.parse(message);

        const { type, senderId, serverId, data } = payload;

        if (type === MessageType.EDIT && serverId !== SERVER_ID) {
          const updates = new Uint8Array(Buffer.from(data.update, 'base64'));
          await docManager.applyEditToDoc(docId, updates);
        }

        const localUsersInDoc = docManager.getLocalUsersInDoc(docId);

        if (!localUsersInDoc) return;

        localUsersInDoc.forEach((userId) => {
          if (userId === senderId) return;

          const user = userManager.getLocalUser(userId);

          if (!user || user.socket.readyState !== WebSocket.OPEN) {
            return;
          }

          if (type === MessageType.EDIT) {
            const update = new Uint8Array(Buffer.from(data.update, 'base64'));

            user.socket.send(
              JSON.stringify({ type: MessageType.EDIT, update })
            );
          } else if (type === MessageType.CURSOR_MOVE) {
            user.socket.send(
              JSON.stringify({
                type: MessageType.CURSOR_MOVE,
                data: {
                  selection: data.selection,
                  name: data.name,
                  userId: senderId,
                  method: data.method
                }
              })
            );
          } else if (type === MessageType.EDITORS_UPDATE) {
            user.socket.send(
              JSON.stringify({
                type: MessageType.EDITORS_UPDATE,
                data
              })
            );
          }
        });
      } catch (error: any) {
        console.error('WSConnection :: initRedisSubscriber ::', error.message);
      }
    });
  }

  public handle = async (ws: WebSocket, req: http.IncomingMessage) => {
    try {
      const { docId, userId, userData, closeConnection } =
        await validateRequest(ws, req, this.userRepository);

      if (closeConnection) {
        return;
      }

      userManager.addLocalUser(userId, {
        userId: userId,
        name: userData!.name,
        socket: ws
      });
      await userManager.setGlobalPresence(docId, userId, {
        name: userData!.name,
        userId,
        selection: {}
      });

      // Creating doc if first time
      await docManager.getOrCreateDoc(docId);

      // Subsribe to channel if user is first on this server intance to join doc
      const localUsers = docManager.getLocalUsersInDoc(docId);

      if (!localUsers || localUsers.size === 0) {
        subClient.subscribe(getChannelKey(docId));
      }

      docManager.addUserToDoc(docId, userId);

      ws.onmessage = (event) =>
        this.handleMessages(event, docId, userId, userData);

      ws.send(JSON.stringify({ type: MessageType.CONNECTION_READY }));

      // Send doc content to new joinee
      await this.sendDocUpdatesTo(docId, userId);

      // Broadcast user presence update via Redis so all instances know a new editor joined
      await this.broadcastPresenceUpdate(docId);

      ws.onclose = () => this.handleOnClose(userId, docId);
    } catch (error: any) {
      console.error('websocket :: handle ::', error);
      ws.close(1011, 'Unauthorized');
    }
  };

  public handleMessages = async (
    event: { data: unknown },
    docId: string,
    userId: string,
    userData: {
      name: string;
      email: string;
    }
  ) => {
    const messageText = toMessageText(event.data);

    if (!messageText) {
      return;
    }

    try {
      let message = JSON.parse(messageText);
      const doc = await docManager.getOrCreateDoc(docId);

      if (!message.type) {
        return;
      }

      const CHANNEL = getChannelKey(docId);

      console.log('Received message:', message.type);

      switch (message.type) {
        case MessageType.EDIT:
          const update = new Uint8Array(Object.values(message.update));

          // Apply locally first to keep this node synchronized
          const updatedDoc = await docManager.applyEditToDoc(docId, update);

          await pubClient.publish(
            CHANNEL,
            JSON.stringify({
              senderId: userId,
              serverId: SERVER_ID,
              type: message.type,
              data: { update: Buffer.from(update).toString('base64') }
            })
          );
          break;

        case MessageType.CURSOR_MOVE:
          await pubClient.publish(
            CHANNEL,
            JSON.stringify({
              senderId: userId,
              serverId: SERVER_ID,
              type: message.type,
              data: {
                userId: userId,
                name: userManager.getLocalUser(userId)!.name,
                selection: message.data,
                method: 'update'
              }
            })
          );

          await userManager.setGlobalPresence(docId, userId, {
            name: userData.name,
            userId: userId,
            selection: message.data
          });

          break;

        case MessageType.SYNC_STEP1:
          const doc = await docManager.getOrCreateDoc(docId);
          const clientSV = new Uint8Array(message.stateVector);

          const diff = Y.encodeStateAsUpdate(doc, clientSV); // diff update: Client does not this

          userManager.sendMessageToLocalUser(userId, {
            type: MessageType.SYNC_STEP2,
            update: Array.from(diff)
          });

          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.log('Failed to parse message:', error);
      return;
    }
  };

  public handleOnClose = async (userId: string, docId: string) => {
    userManager.removeLocalUser(userId);

    await userManager.removeGlobalPresence(docId, userId);

    docManager.removeUser(userId);

    // Broadcast user presence update via Redis so all instances know a editor disconnected
    this.broadcastPresenceUpdate(docId);

    const localUsers = docManager.getLocalUsersInDoc(docId);

    if (!localUsers || localUsers.size === 0) {
      await subClient.unsubscribe(getChannelKey(docId));
    }
  };

  public broadcastPresenceUpdate = async (docId: string) => {
    const CHANNEL = getChannelKey(docId);

    const users = await userManager.getAllUsersInDoc(docId);

    await pubClient.publish(
      CHANNEL,
      JSON.stringify({
        type: MessageType.EDITORS_UPDATE,
        senderId: 'SYSTEM',
        data: users
      })
    );
  };

  private sendDocUpdatesTo = async (docId: string, userId: string) => {
    const latexCode = (
      await storage.getProjectFile(docId, 'main.tex')
    ).toString('utf-8');

    const user = userManager.getLocalUser(userId);

    if (user && user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(
        JSON.stringify({
          type: MessageType.DOC_UPDATE,
          code: latexCode
        })
      );
    }
  };
}

export const wsConnection = new WSConnection();
