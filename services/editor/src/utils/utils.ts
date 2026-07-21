import http from "http";
import * as Y from "yjs";

import {
  REDIS_CHANNEL_DOC,
  REDIS_KEY_PRESENCE,
} from "../config/constants.js";
import type { docType } from "../models/docs.model.js";
import { decodeJWT } from "@cotex/auth";
import type { UserRepository } from "../repositories/user.repository.js";
import type WebSocket from "ws";
import { config } from "../config/env.js";

export const getLatexCode = (doc: docType) => {
  const ydoc = new Y.Doc();

  Y.applyUpdate(ydoc, new Uint8Array(doc.ydocData));

  const ytext = ydoc.getText("sharedLatexCode");

  const latexCode = ytext.toString();

  return latexCode;
};

export const getChannelKey = (docId: string) => {
  return `${REDIS_CHANNEL_DOC}:${docId}`;
};

export const getPresenceKey = (docId: string) => {
  return `${REDIS_KEY_PRESENCE}:${docId}`;
};

/**
 * Validate user request, If valid returns docId, userId, userData(fetched from DB) and closeConnection,
 * otherwise reject if not valid
 */
export const validateRequest = async (
  ws: WebSocket,
  req: http.IncomingMessage,
  userRepository: UserRepository,
): Promise<{
  docId: string;
  userId: string;
  userData: {
    name: string;
    email: string;
  };
  closeConnection: boolean;
}> => {
  const params = new URLSearchParams(req.url?.split("?")[1]);
  const token = params.get("token");
  const docId = params.get("docId");

  const response = {
    userData: {
      email: "",
      name: "",
    },
    userId: "",
    docId: "",
    closeConnection: true,
  };

  if (!token) {
    ws.close(1008, "Invalid Token");
    return response;
  }
  if (!docId) {
    ws.close(1008, "Document ID required");
    return response;
  }

  const decode = decodeJWT(token, config.TOKEN_SECRET);

  if (!decode) {
    ws.close(1008, "Unauthorized");
    return response;
  }

  const userData = await userRepository.findById(decode.userId);

  if (!userData) {
    console.log("WebSocket connection rejected: User not found");
    ws.close(1008, "Unauthorized");
    return response;
  }

  response.docId = docId;
  response.closeConnection = false;
  response.userData = userData;
  response.userId = decode.userId;

  return response;
};
