import { compareSync, hashSync } from "bcrypt-ts";
import { User, IUserRepository } from "@/modules/users";
import {
  IAuthService,
  SignInCredentials,
  SignUpOwnerDTO,
  UserTokenPayload,
} from "../domain/auth.entity";
import { createSessionToken, verifySessionToken } from "./jwt";
import { isValidPeruvianPhone, normalizePhoneToE164 } from "@/shared/lib/phone";

export class LocalAuthService implements IAuthService {
  constructor(private userRepo: IUserRepository) {}

  async signUpOwner(
    dto: SignUpOwnerDTO
  ): Promise<{ user: User; sessionToken: string }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new Error("Ya existe una cuenta registrada con este correo electrónico.");
    }

    if (!isValidPeruvianPhone(dto.telefono_whatsapp)) {
      throw new Error(
        "El teléfono de WhatsApp debe ser un número celular peruano válido (ej. +51987654321 o 987654321)."
      );
    }

    const normalizedPhone = normalizePhoneToE164(dto.telefono_whatsapp);
    const passwordHash = hashSync(dto.password, 10);
    const userId = `usr-owner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Todo nuevo propietario arranca en estado 'pendiente' para moderación del admin
    const user = await this.userRepo.create({
      id: userId,
      role: "owner",
      nombre: dto.nombre.trim(),
      email: dto.email.toLowerCase().trim(),
      password_hash: passwordHash,
      telefono_whatsapp: normalizedPhone,
      nombre_negocio: dto.nombre_negocio?.trim() || null,
      estado: "pendiente",
    });

    const sessionToken = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      estado: user.estado,
      nombre: user.nombre,
    });

    return { user, sessionToken };
  }

  async signIn(
    credentials: SignInCredentials
  ): Promise<{ user: User; sessionToken: string }> {
    const user = await this.userRepo.findByEmail(credentials.email);
    if (!user) {
      throw new Error("Credenciales inválidas. Verifica tu correo y contraseña.");
    }

    const isValid = compareSync(credentials.password, user.password_hash);
    if (!isValid) {
      throw new Error("Credenciales inválidas. Verifica tu correo y contraseña.");
    }

    if (user.estado === "suspendido") {
      throw new Error(
        "Tu cuenta ha sido suspendida por el administrador. Contáctate con soporte."
      );
    }

    const sessionToken = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      estado: user.estado,
      nombre: user.nombre,
    });

    return { user, sessionToken };
  }

  async verifySessionToken(token: string): Promise<UserTokenPayload | null> {
    return verifySessionToken(token);
  }

  async getUserFromToken(token: string): Promise<User | null> {
    const payload = await verifySessionToken(token);
    if (!payload?.sub) {
      return null;
    }
    return this.userRepo.findById(payload.sub);
  }
}
