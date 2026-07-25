import mongoose from "mongoose";

export interface UserType {
  name: string;
  email: string;
  password?: string;
  generateToken: () => string;
}

export interface UserMethods {
  generateToken(): string;
  verifyPassword(password: string): Promise<boolean>;
}

export type UserDocument = mongoose.HydratedDocument<UserType, UserMethods>;

// export interface editingUser {
//   name: string;
//   userId: string;
//   selection: {
//     anchor?: {
//       lineNumber?: number;
//       column?: number;
//     };
//     head?: {
//       lineNumber?: number;
//       column?: number;
//     };
//   };
// }

export interface GlobalUserData {
  userId: string;
  name: string;
  selection: {
    anchor?: {
      lineNumber?: number;
      column?: number;
    };
    head?: {
      lineNumber?: number;
      column?: number;
    };
  };
}
