class LockManager {
  private locks: Map<string, boolean>;

  constructor() {
    this.locks = new Map();
  }

  /**
   * Locks directory of compilation for a document. If the document is already being compiled,
   * it returns empty object.
   */
  public acquireLock = (docId: string) => {
    if (this.locks.get(docId)) {
      return {};
    }

    this.locks.set(docId, true);

    return {
      release: () => this.locks.delete(docId),
    };
  };
}

const lockManager = new LockManager();

export { lockManager };
