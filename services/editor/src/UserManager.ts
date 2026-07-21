import WebSocket from "ws";
import type { GlobalUserData } from "@cotex/shared-types";
import { getPresenceKey } from "./utils/utils.js";
import { pubClient } from "./redis.client.js";

class User {
  public userId: string;
  public name: string;
  public socket: WebSocket;

  constructor({
    userId,
    name,
    socket,
  }: {
    userId: string;
    name: string;
    socket: WebSocket;
  }) {
    this.userId = userId;
    this.name = name;
    this.socket = socket;
  }
}

class UserManager {
  private localUsers: Map<string, User> = new Map(); // userId -> User

  // 1. LOCAL STATE: Manages active WebSockets connected ONLY to this node
  public addLocalUser = (
    userId: string,
    user: { userId: string; name: string; socket: WebSocket },
  ) => {
    const userObj = new User(user);
    this.localUsers.set(userId, userObj);
  };

  public removeLocalUser = (userId: string) => {
    const user = this.localUsers.get(userId);

    if (user && user.socket.readyState === WebSocket.OPEN) {
      user.socket.close(1000, "Connection closed by server");
    }

    this.localUsers.delete(userId);
  };

  public getLocalUser = (userId: string): User | undefined => {
    return this.localUsers.get(userId);
  };

  public sendMessageToLocalUser = (userId: string, message: string) => {
    const user = this.getLocalUser(userId);

    if (user && user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(message);
    }
  };

  // 2. GLOBAL STATE (REDIS): Manages the exact presence data across all nodes
  public setGlobalPresence = async (
    docId: string,
    userId: string,
    userData: GlobalUserData,
  ) => {
    const presenceKey = getPresenceKey(docId);
    await pubClient.hset(presenceKey, userId, JSON.stringify(userData));
  };

  public removeGlobalPresence = async (docId: string, userId: string) => {
    const presenceKey = getPresenceKey(docId);
    await pubClient.hdel(presenceKey, userId);
  };

  public getAllUsersInDoc = async (
    docId: string,
  ): Promise<GlobalUserData[]> => {
    const presenceKey = getPresenceKey(docId);
    const allUsers = await pubClient.hgetall(presenceKey);

    return Object.values(allUsers).map(
      (userStr) => JSON.parse(userStr as string) as GlobalUserData,
    );
  };
}

const userManager = new UserManager();

export { userManager };
