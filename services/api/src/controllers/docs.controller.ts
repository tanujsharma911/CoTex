import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import * as Y from "yjs";

import type { docType } from "../models/docs.model.js";
import { getCompileDir, getLatexCode } from "../utils/utils.js";
import { lockManager } from "../LockManager.js";
import type { DocsRepository } from "../repositories/docs.repository.js";
import { promisify } from "util";
import { DEFAULT_LATEX_TEMPLATE } from "../config/constants.js";

const executeCommand = promisify(exec);

class DocsController {
  private docsRepository: DocsRepository;

  constructor(docsRepository: DocsRepository) {
    this.docsRepository = docsRepository;
  }

  public getDocs = async (req: Request, res: Response) => {
    try {
      const { docId } = req.params ?? {};

      const userId = req.user.userId;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      let docs: docType[] = [];

      if (docId && typeof docId === "string") {
        const docsTemp = await this.docsRepository.getDoc(docId);

        const hasAccess =
          docsTemp?.ownerId === userId || docsTemp?.visibility === "public";

        if (!hasAccess) {
          return res.status(403).json({
            message: "Forbidden: You do not have access to this document",
          });
        }

        docs = docsTemp ? [docsTemp] : [];
      } else {
        const userId = req.user.userId;

        //TODO: Paginate this if it returns a lot of documents
        docs = await this.docsRepository.getDocsByUserId(userId);
      }

      return res.status(200).json({
        message: "Document retrieved successfully",
        data: docs,
      });
    } catch (error) {
      console.log(error instanceof Error ? error.message : "Unknown error");

      return res.status(500).json({
        message: "An error occurred while retrieving the document",
      });
    }
  };

  public createDocs = async (req: Request, res: Response) => {
    try {
      const { name, templateCode, visibility } = req.body ?? {};

      if (!name || typeof name !== "string") {
        res
          .status(400)
          .json({ message: "Document name is required and must be a string" });
        return;
      }

      if (templateCode && typeof templateCode !== "string") {
        res.status(400).json({ message: "Template code must be a string" });
        return;
      }

      const ydoc = new Y.Doc();

      const ytext = ydoc.getText("sharedLatexCode");

      ytext.insert(0, templateCode || DEFAULT_LATEX_TEMPLATE);

      const dataBuffer = Buffer.from(Y.encodeStateAsUpdate(ydoc));

      const userId = req.user.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const newDoc = await this.docsRepository.createDoc({
        name,
        ydocData: dataBuffer,
        ownerId: userId,
        visibility: visibility || "public",
        deleted: false,
        editVersion: 0,
      });

      res.status(201).json({
        message: "Document created successfully",
        data: newDoc,
      });
    } catch (error) {
      console.log(error instanceof Error ? error.message : "Unknown error");

      res.status(500).json({
        message: "An error occurred while creating the document",
      });
    }
  };

  /**
   * Updates meta information of a doc, such as the document name or other properties. The actual content of the document is not updated through this endpoint.
   */
  public updateDocs = async (req: Request, res: Response) => {
    try {
      const { docId } = req.params ?? {};
      const { name, visibility } = req.body ?? {};

      if (!docId || typeof docId !== "string") {
        res
          .status(400)
          .json({ message: "Document ID is required and must be a string" });
        return;
      }
      if (!name && !visibility) {
        res
          .status(400)
          .json({ message: "At least one field to update must be provided" });
        return;
      }

      const userId = req.user.userId;

      const doc = await this.docsRepository.getDoc(docId);

      if (!doc) {
        res.status(404).json({ message: "Document not found" });
        return;
      }

      const isOwner = doc.ownerId === userId;

      if (!isOwner) {
        res.status(403).json({
          message:
            "Forbidden: You are not the owner of this document and do not have permission to update it",
        });
        return;
      }

      const updatedDoc = await this.docsRepository.updateDoc(docId, {
        name,
        visibility,
      });

      res.status(200).json({
        message: "Document updated successfully",
        data: updatedDoc,
      });
    } catch (error) {
      console.log(error instanceof Error ? error.message : "Unknown error");

      res.status(500).json({
        message: "An error occurred while updating the document",
      });
    }
  };

  public deleteDocs = async (req: Request, res: Response) => {
    try {
      const { docId } = req.params ?? {};

      if (!docId || typeof docId !== "string") {
        res
          .status(400)
          .json({ message: "Document ID is required and must be a string" });
        return;
      }

      const userId = req.user.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const doc = await this.docsRepository.getDoc(docId);

      if (!doc) {
        res.status(404).json({ message: "Document not found" });
        return;
      }

      const isUserAuthorized = doc.ownerId === userId;

      if (!isUserAuthorized) {
        res.status(403).json({
          message:
            "Forbidden: You do not have permission to delete this document",
        });
        return;
      }

      await this.docsRepository.deleteDoc(docId);

      res.status(200).json({
        message: "Document deleted successfully",
      });
    } catch (error) {
      console.log(error instanceof Error ? error.message : "Unknown error");

      res.status(500).json({
        message: "An error occurred while deleting the document",
      });
    }
  };

  public compile = async (req: Request, res: Response) => {
    const { docId } = req.params ?? {};

    if (!docId || typeof docId !== "string") {
      res.status(400).json({
        message: "Document ID and code is required and must be a string",
      });
      return;
    }

    const compileDir = getCompileDir(docId);
    const lock = lockManager.acquireLock(compileDir);

    if (!lock || lock.release === undefined) {
      return res.status(423).json({
        message:
          "Document is currently being compiled by another process. Please try again later.",
      });
    }

    try {
      const doc = await this.docsRepository.getDoc(docId);

      if (!doc) {
        res.status(404).json({ message: "Document not found with this ID" });
        return;
      }
      const latexCode = getLatexCode(doc);

      if (!latexCode) {
        return res.status(400).json({
          message: "Document does not contain any LaTeX code to compile.",
        });
      }

      await fs.mkdir(compileDir, { recursive: true });

      await fs.writeFile(path.join(compileDir, "content.tex"), latexCode);

      try {
        await executeCommand(`pdflatex -interaction=nonstopmode content.tex`, {
          cwd: compileDir,
          timeout: 30_000, // 30 second timeout
        });
      } catch (error: any) {
        return res.status(430).json({
          message:
            "There is some error in the LaTeX code. Please fix it and try again.",

          error: error.stdout,
        });
      }

      const pdfPath = path.join(compileDir, "content.pdf");

      await fs.access(pdfPath);

      const docCurr = await this.docsRepository.getDoc(docId);

      if (!docCurr || docCurr.deleted) {
        res.status(404).json({
          message: "Document not found with this ID after compilation",
        });
        return;
      }

      const updatedDoc = await this.docsRepository.updateDoc(docId, {
        pdf: await fs.readFile(pdfPath),
      });

      // await fs.rm(compileDir, { recursive: true, force: true });

      return res.status(200).json({
        message: "Document compiled successfully",
        data: updatedDoc,
      });
    } catch (error) {
      console.log(error instanceof Error ? error.message : "Unknown error");

      res.status(500).json({
        message: "An error occurred while compiling the document",
      });
    } finally {
      lock.release();
    }
  };
}

export { DocsController };
