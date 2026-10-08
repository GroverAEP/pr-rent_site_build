import { describe, it, expect, beforeAll } from "vitest";
import { getRepositories } from "@/shared/db/factory";
import { LocalAuthService } from "@/modules/auth";
import { runSeed } from "../../scripts/seed";
import { env } from "@/shared/config/env";

describe("Authentication & RBAC Security", () => {
  let authService: LocalAuthService;
  const repos = getRepositories();

  beforeAll(async () => {
    await runSeed();
    authService = new LocalAuthService(repos.users);
  });

  describe("Owner Registration (signUpOwner)", () => {
    it("debe registrar un nuevo propietario en estado 'pendiente' y devolver un JWT válido", async () => {
      const uniqueEmail = `nuevo.owner.${Date.now()}@inmobiliaria.pe`;
      const res = await authService.signUpOwner({
        nombre: "Alejandro Castro",
        email: uniqueEmail,
        password: "PasswordSeguro2026!",
        telefono_whatsapp: "+51 987 111 222",
        nombre_negocio: "Inmobiliaria Castro",
      });

      expect(res.user).toBeDefined();
      expect(res.user.role).toBe("owner");
      expect(res.user.estado).toBe("pendiente"); // Inicia pendiente para moderación
      expect(res.user.telefono_whatsapp).toBe("+51987111222"); // Normalizado E.164
      expect(res.sessionToken).toBeDefined();

      const verified = await authService.verifySessionToken(res.sessionToken);
      expect(verified?.sub).toBe(res.user.id);
      expect(verified?.role).toBe("owner");
    });

    it("debe rechazar registro con correo duplicado", async () => {
      await expect(
        authService.signUpOwner({
          nombre: "Duplicado",
          email: "carlos.mendoza@inmobiliariacentro.pe", // Ya existe en seed
          password: "Password123!",
          telefono_whatsapp: "+51999111222",
        })
      ).rejects.toThrow("Ya existe una cuenta");
    });

    it("debe rechazar registro con teléfono no peruano o inválido", async () => {
      await expect(
        authService.signUpOwner({
          nombre: "Teléfono Inválido",
          email: `invalido.${Date.now()}@correo.pe`,
          password: "Password123!",
          telefono_whatsapp: "+1234567890", // No es peruano
        })
      ).rejects.toThrow("número celular peruano válido");
    });
  });

  describe("Authentication Flow (signIn)", () => {
    it("debe autenticar al Administrador General y otorgar rol 'admin'", async () => {
      const res = await authService.signIn({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      });

      expect(res.user.role).toBe("admin");
      expect(res.user.estado).toBe("activo");

      const payload = await authService.verifySessionToken(res.sessionToken);
      expect(payload?.role).toBe("admin");
    });

    it("debe autenticar a un Propietario con credenciales correctas", async () => {
      const res = await authService.signIn({
        email: "carlos.mendoza@inmobiliariacentro.pe",
        password: "Password123!",
      });

      expect(res.user.role).toBe("owner");
      expect(res.user.nombre).toBe("Carlos Mendoza Ramos");
    });

    it("debe rechazar inicio de sesión con contraseña equivocada", async () => {
      await expect(
        authService.signIn({
          email: env.ADMIN_EMAIL,
          password: "ClaveTotalmenteIncorrecta!",
        })
      ).rejects.toThrow("Credenciales inválidas");
    });

    it("debe rechazar inicio de sesión con correo no existente", async () => {
      await expect(
        authService.signIn({
          email: "no.existe@localvista.pe",
          password: "Password123!",
        })
      ).rejects.toThrow("Credenciales inválidas");
    });

    it("debe rechazar inicio de sesión a usuarios con estado 'suspendido'", async () => {
      // Crear un usuario suspendido para probar el bloqueo
      const suspendedUser = await repos.users.create({
        id: `usr-sus-${Date.now()}`,
        role: "owner",
        nombre: "Usuario Malicioso",
        email: `suspendido.${Date.now()}@spam.pe`,
        password_hash: resHash("Password123!"),
        telefono_whatsapp: "+51999888111",
        nombre_negocio: null,
        estado: "suspendido",
      });

      await expect(
        authService.signIn({
          email: suspendedUser.email,
          password: "Password123!",
        })
      ).rejects.toThrow("Tu cuenta ha sido suspendida");
    });
  });

  describe("Token Verification & User Retrieval", () => {
    it("debe recuperar el usuario completo a partir del token", async () => {
      const signInRes = await authService.signIn({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      });

      const user = await authService.getUserFromToken(signInRes.sessionToken);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(env.ADMIN_EMAIL.toLowerCase());
    });

    it("debe retornar null ante un token adulterado", async () => {
      const tampered = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.token";
      const verified = await authService.verifySessionToken(tampered);
      expect(verified).toBeNull();
    });
  });
});

import { hashSync } from "bcrypt-ts";
function resHash(pwd: string) {
  return hashSync(pwd, 10);
}
