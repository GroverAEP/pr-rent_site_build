import { env } from "@/shared/config/env";
import {
  IUserRepository,
  SqliteUserRepository,
  SupabaseUserRepository,
} from "@/modules/users";
import {
  ILocalRepository,
  SqliteLocalRepository,
  SupabaseLocalRepository,
} from "@/modules/locales";
import {
  ILeadRepository,
  SqliteLeadRepository,
  SupabaseLeadRepository,
} from "@/modules/leads";
import {
  IAuditLogRepository,
  SqliteAuditLogRepository,
  SupabaseAuditLogRepository,
} from "@/modules/admin";
import {
  IMediaRepository,
  SqliteMediaRepository,
  SupabaseMediaRepository,
  IStorageService,
  LocalDiskStorageService,
  SupabaseStorageService,
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

  if (env.DB_DRIVER === "supabase") {
    cachedRepos = {
      users: new SupabaseUserRepository(),
      locales: new SupabaseLocalRepository(),
      leads: new SupabaseLeadRepository(),
      audit: new SupabaseAuditLogRepository(),
      media: new SupabaseMediaRepository(),
      storage: new SupabaseStorageService(),
    };
    return cachedRepos;
  }

  throw new Error(`Driver de base de datos no soportado: ${env.DB_DRIVER}`);
}

export function resetRepositoriesCache(): void {
  cachedRepos = null;
}
