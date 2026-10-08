import { User, UserRole } from "@/modules/users";

export interface AuthSession {
  user: {
    id: string;
    email: string;
    nombre: string;
    role: UserRole;
    estado: string;
    telefono_whatsapp: string;
    nombre_negocio: string | null;
  };
  expiresAt: Date;
}

export interface UserTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  estado: string;
  nombre: string;
  [key: string]: unknown;
}

export interface SignUpOwnerDTO {
  nombre: string;
  email: string;
  password: string;
  telefono_whatsapp: string;
  nombre_negocio?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface IAuthService {
  signUpOwner(dto: SignUpOwnerDTO): Promise<{ user: User; sessionToken: string }>;
  signIn(credentials: SignInCredentials): Promise<{ user: User; sessionToken: string }>;
  verifySessionToken(token: string): Promise<UserTokenPayload | null>;
  getUserFromToken(token: string): Promise<User | null>;
}
