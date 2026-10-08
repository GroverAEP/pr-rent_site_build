import { cookies } from "next/headers";
import { getRepositories } from "@/shared/db/factory";
import { LocalAuthService } from "./local-auth.service";
import { User } from "@/modules/users";
import { UserTokenPayload } from "../domain/auth.entity";

export const SESSION_COOKIE_NAME = "lv_auth_session";

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 días
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  const repos = getRepositories();
  const authService = new LocalAuthService(repos.users);
  return authService.getUserFromToken(token);
}

export async function getCurrentUserPayload(): Promise<UserTokenPayload | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  const repos = getRepositories();
  const authService = new LocalAuthService(repos.users);
  return authService.verifySessionToken(token);
}
