import type { docType } from "@cotex/types";
import mongoose from "mongoose";

const docsSchema = new mongoose.Schema<docType>(
  {
    name: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "public",
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    editVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Docs = mongoose.model<docType>("Docs", docsSchema);
