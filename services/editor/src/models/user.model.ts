import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { UserDocument } from "@cotex/shared-types";
import { config } from "../config/env.js";
import { createJWT } from "@cotex/auth";

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      default: "Anonymous",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Before save
userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Before get
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

// Verify
userSchema.methods.verifyPassword = async function (
  this: UserDocument,
  password: string,
) {
  if (!this.password) return false;

  return await bcrypt.compare(password, this.password);
};

// Handling token
userSchema.methods.generateToken = function (this: UserDocument) {
  return createJWT(
    { userId: this._id.toString() },
    config.TOKEN_SECRET,
    config.TOKEN_EXPIRY,
  );
};

export const User = mongoose.model<UserDocument>("User", userSchema);
