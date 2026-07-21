import jwt from "jsonwebtoken";

export function createJWT(payload: object, secret: string, expiresIn: any) {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
}

export function decodeJWT(token: string, secret: string) {
  return jwt.verify(token, secret) as { userId: string } | undefined;
}
