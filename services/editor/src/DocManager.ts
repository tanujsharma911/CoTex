import * as Y from 'yjs';
import debounce, { type DebouncedFunction } from 'debounce';

import { storage } from './storage.js';
import { DocsRepository } from './repositories/docs.repository.js';
import { YDOC_MAIN_LATEX } from '@cotex/constants';

class DocManager {
  private docId_doc: Map<string, Y.Doc> = new Map(); // docId -> Y.Doc
  private docId_users: Map<string, Set<string>> = new Map(); // docId -> Set of user IDs
  private persistTimers: Map<string, DebouncedFunction<() => Promise<void>>> =
    new Map();

  private docsRepository = new DocsRepository();

  public getOrCreateDoc = async (docId: string) => {
    let ydoc = this.docId_doc.get(docId);

    if (!ydoc) {
      ydoc = new Y.Doc();

      try {
        const latexCode = await storage.getLatexCode(docId);

        if (latexCode) {
          ydoc.getText(YDOC_MAIN_LATEX).insert(0, latexCode);
        }
      } catch {}

      this.docId_doc.set(docId, ydoc);
    }

    return ydoc;
  };

  public applyEditToDoc = async (docId: string, update: Uint8Array) => {
    const ydoc = await this.getOrCreateDoc(docId);

    Y.applyUpdate(ydoc, update);

    this.persist(docId);

    return ydoc;
  };

  public deleteDoc = async (docId: string) => {
    const debounced = this.persistTimers.get(docId);

    if (debounced) {
      debounced.flush();
    } else {
      const ydoc = this.docId_doc.get(docId);

      if (ydoc) {
        const latexContent = ydoc.getText(YDOC_MAIN_LATEX).toString();
        await storage
          .saveLatexCode(docId, latexContent)
          .catch((err) =>
            console.error(`Failed final persist for ${docId}:`, err)
          );
      }
    }

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

  private persist(docId: string): void {
    if (!this.persistTimers.has(docId)) {
      const debouncedPersist = debounce(async () => {
        const ydoc = this.docId_doc.get(docId);

        if (!ydoc) return;

        const latexContent = ydoc.getText(YDOC_MAIN_LATEX).toString();

        try {
          await storage.saveLatexCode(docId, latexContent);
        } catch (err) {
          console.error(`Failed to persist doc ${docId}:`, err);
        }
      }, 10000); // 10 second debounce

      this.persistTimers.set(docId, debouncedPersist);
    }

    this.persistTimers.get(docId)!();
  }
}

const docManager = new DocManager();

export { docManager };
