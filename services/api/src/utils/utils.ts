import path from "path";
import * as Y from "yjs";

import { COMPILE_DIR } from "../config/constants.js";
import type { docType } from "../models/docs.model.js";

export const getCompileDir = (docId: string) => {
  return path.join(COMPILE_DIR, docId);
};

// export const getLatexCode = (doc: docType) => {
//   const ydoc = new Y.Doc();

//   Y.applyUpdate(ydoc, new Uint8Array(doc.ydocData));

//   const ytext = ydoc.getText("sharedLatexCode");

//   const latexCode = ytext.toString();

//   return latexCode;
// };
