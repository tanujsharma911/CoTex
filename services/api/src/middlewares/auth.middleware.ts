import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { decodeJWT } from "@cotex/auth";

// export const decodeJWT = (
//   token: string | null,
// ): { userId: string } | undefined => {
//   if (!token) {
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, config.TOKEN_SECRET);
//     return decoded as { userId: string };
//   } catch (error) {
//     return;
//   }
// };

export const authMiddleware = (req: any, res: any, next: any) => {
  const params = new URLSearchParams(req.url?.split("?")[1]);

  const token = params.get("token");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  const decoded = decodeJWT(token, config.TOKEN_SECRET);

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  req.user = decoded;
  next();
};
