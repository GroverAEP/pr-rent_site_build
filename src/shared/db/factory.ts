import { env } from "@/shared/config/env";
import { IUserRepository, SqliteUserRepository } from "@/modules/users";
import { ILocalRepository, SqliteLocalRepository } from "@/modules/locales";
import { ILeadRepository, SqliteLeadRepository } from "@/modules/leads";
import { IAuditLogRepository, SqliteAuditLogRepository } from "@/modules/admin";
import {
  IMediaRepository,
  SqliteMediaRepository,
  IStorageService,
  LocalDiskStorageService,
} from "@/modules/media";

export interface AppRepositories {
  users: IUserRepository;
  locales: ILocalRepository;
  leads: ILeadRepository;
  audit: IAuditLogRepository;
  media: IMediaRepository;
  storage: IStorageService;
}

let cachedRepos: AppRepositories | null = null;

export function getRepositories(): AppRepositories {
  if (cachedRepos) {
    return cachedRepos;
  }

  if (env.DB_DRIVER === "sqlite") {
    cachedRepos = {
      users: new SqliteUserRepository(),
      locales: new SqliteLocalRepository(),
      leads: new SqliteLeadRepository(),
      audit: new SqliteAuditLogRepository(),
      media: new SqliteMediaRepository(),
      storage: new LocalDiskStorageService(),
    };
    return cachedRepos;
  }

  // En producción (DB_DRIVER === "supabase")
  // Se integrarán los adaptadores de Supabase (Fase 8)
  throw new Error(
    "Supabase driver no configurado aún en este entorno. Utiliza DB_DRIVER=sqlite en desarrollo."
  );
}

export function resetRepositoriesCache(): void {
  cachedRepos = null;
}
