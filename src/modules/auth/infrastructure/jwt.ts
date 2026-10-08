import { SignJWT, jwtVerify } from "jose";
import { env } from "@/shared/config/env";
import { UserTokenPayload } from "../domain/auth.entity";

const secretKey = new TextEncoder().encode(env.AUTH_SECRET);

export async function createSessionToken(
  payload: Omit<UserTokenPayload, "exp" | "iat">
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string
): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as UserTokenPayload;
  } catch {
    return null;
  }
}
