import { Router, type Router as ExpressRouter } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { DocsRepository } from "../repositories/docs.repository.js";
import { DocsController } from "../controllers/docs.controller.js";

const docsRoute: ExpressRouter = Router();

const docsRepository = new DocsRepository();
const docsController = new DocsController(docsRepository);

/**
 * Returns metadata of all documents in which user is owner.
 */
docsRoute.get("/", authMiddleware, docsController.getDocs);

/**
 * This endpoint is intended for creating a new document with its initial content.
 * The request body should contain the document name and the initial content of the document.
 */
docsRoute.post("/create", authMiddleware, docsController.createDocs);

/**
 * Returns metadata of a specific document if the user has access to it(editor, owner or viewer).
 */
docsRoute.get("/:docId", authMiddleware, docsController.getDocs);

/**
 * This endpoint is intended for updating meta information of a doc, such as the document name or other properties.
 * The actual content of the document is not updated through this endpoint.
 */
docsRoute.put("/:docId", authMiddleware, docsController.updateDocs);

/**
 * This endpoint is intended for deleting a document.
 * It will remove the document and all its associated data from the database.
 *
 * NOTE: How to handle document deletion when multiple users are collaborating on the same document?
 */
docsRoute.delete("/:docId", authMiddleware, docsController.deleteDocs);

docsRoute.get("/:docId/compile/", authMiddleware, docsController.compile);

export { docsRoute };
