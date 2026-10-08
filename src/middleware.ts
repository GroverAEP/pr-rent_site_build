import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "lv_auth_session";
const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET || "localvista-dev-secret-super-key-32-chars-long-2026"
);

interface TokenPayload {
  sub: string;
  role: "admin" | "owner";
  email: string;
  estado: string;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  // 1. Proteger rutas de Propietario (/panel)
  if (pathname.startsWith("/panel")) {
    if (!payload) {
      const loginUrl = new URL("/ingresar", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (payload.estado === "suspendido") {
      const response = NextResponse.redirect(new URL("/ingresar?error=suspended", request.url));
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  // 2. Proteger rutas de Administrador (/admin)
  if (pathname.startsWith("/admin")) {
    if (!payload) {
      const loginUrl = new URL("/ingresar", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (payload.role !== "admin") {
      // Propietarios intentando entrar al panel de administración son redirigidos a su panel
      return NextResponse.redirect(new URL("/panel", request.url));
    }
  }

  // 3. Rutas de autenticación (/ingresar, /registro):
  // Si ya tiene sesión activa, redirigir a su panel correspondiente
  if (pathname === "/ingresar" || pathname === "/registro") {
    if (payload) {
      const target = payload.role === "admin" ? "/admin" : "/panel";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/admin/:path*",
    "/ingresar",
    "/registro",
  ],
};
