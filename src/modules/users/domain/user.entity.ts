export type UserRole = "admin" | "owner";
export type UserStatus = "pendiente" | "activo" | "suspendido";

export interface User {
  id: string;
  role: UserRole;
  nombre: string;
  email: string;
  password_hash: string;
  telefono_whatsapp: string;
  nombre_negocio: string | null;
  estado: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAdmin(): Promise<User | null>;
  countAdmins(): Promise<number>;
  create(user: Omit<User, "created_at" | "updated_at">): Promise<User>;
  update(id: string, partial: Partial<Omit<User, "id">>): Promise<User>;
  list(filter?: {
    role?: UserRole;
    estado?: UserStatus;
    search?: string;
  }): Promise<User[]>;
}
