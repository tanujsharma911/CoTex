import path from "path";

import { COMPILE_DIR } from "../config/constants.js";

export const getCompileDir = (docId: string) => {
  return path.join(COMPILE_DIR, docId);
};
