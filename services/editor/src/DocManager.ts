import * as Y from "yjs";
import { DocsRepository } from "./repositories/docs.repository.js";

class DocManager {
  private docId_doc: Map<string, Y.Doc> = new Map(); // docId -> Y.Doc
  private docId_users: Map<string, Set<string>> = new Map(); // docId -> Set of user IDs

  private docsRepository = new DocsRepository();

  public getOrCreateDoc = async (docId: string) => {
    let ydoc = this.docId_doc.get(docId);

    if (!ydoc) {
      ydoc = new Y.Doc();

      const doc = await this.docsRepository.getDoc(docId);

      if (doc?.ydocData) {
        const updates = new Uint8Array(doc.ydocData);

        Y.applyUpdate(ydoc, updates);
      }

      this.docId_doc.set(docId, ydoc);
    }

    return ydoc;
  };

  public applyEditToDoc = async (docId: string, update: Uint8Array) => {
    const ydoc = await this.getOrCreateDoc(docId);

    Y.applyUpdate(ydoc, update);

    return ydoc;
  };

  public deleteDoc = async (docId: string) => {
    this.docId_doc.delete(docId);
    this.docId_users.delete(docId);
  };

  public addUserToDoc = (docId: string, userId: string) => {
    if (!this.docId_users.has(docId)) {
      this.docId_users.set(docId, new Set());
    }
    this.docId_users.get(docId)?.add(userId);
  };

  public removeUser = (userId: string) => {
    this.docId_users.forEach((localUsers, docId) => {
      if (localUsers.has(userId)) {
        localUsers.delete(userId);

        if (localUsers.size === 0) {
          this.deleteDoc(docId);
        }
      }
    });
  };

  public getLocalUsersInDoc = (docId: string): Set<string> | undefined => {
    return this.docId_users.get(docId);
  };
}

const docManager = new DocManager();

export { docManager };
