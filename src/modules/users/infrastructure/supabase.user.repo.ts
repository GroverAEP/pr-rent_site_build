import { getSupabaseServiceClient } from "@/shared/db/supabase.driver";
import {
  User,
  IUserRepository,
  UserRole,
  UserStatus,
} from "../domain/user.entity";

export class SupabaseUserRepository implements IUserRepository {
  private get db() {
    return getSupabaseServiceClient();
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .ilike("email", email)
      .single();
    if (error || !data) return null;
    return data as User;
  }

  async findAdmin(): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .eq("role", "admin")
      .limit(1)
      .single();
    if (error || !data) return null;
    return data as User;
  }

  async countAdmins(): Promise<number> {
    const { count, error } = await this.db
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) return 0;
    return count ?? 0;
  }

  async create(user: Omit<User, "created_at" | "updated_at">): Promise<User> {
    // Regla de dominio estricta: Solo puede existir 1 administrador
    if (user.role === "admin") {
      const adminCount = await this.countAdmins();
      if (adminCount >= 1) {
        throw new Error(
          "Violación de regla de negocio: Solo puede existir un único administrador en la plataforma."
        );
      }
    }

    const now = new Date().toISOString();
    const { id: suppliedId, ...userFields } = user;
    void suppliedId;
    const row = {
      ...userFields,
      email: user.email.toLowerCase(),
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await this.db
      .from("users")
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`Error al crear usuario: ${error.message}`);
    return data as User;
  }

  async update(id: string, partial: Partial<Omit<User, "id">>): Promise<User> {
    const current = await this.findById(id);
    if (!current) throw new Error(`Usuario con id ${id} no encontrado.`);

    // Si se intenta promover a admin, verificar si ya existe otro
    if (partial.role === "admin" && current.role !== "admin") {
      const adminCount = await this.countAdmins();
      if (adminCount >= 1) {
        throw new Error(
          "Violación de regla de negocio: Ya existe un administrador registrado."
        );
      }
    }

    const updateData = {
      ...partial,
      email: partial.email ? partial.email.toLowerCase() : undefined,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    );

    const { data, error } = await this.db
      .from("users")
      .update(cleanData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar usuario: ${error.message}`);
    return data as User;
  }

  async list(filter?: {
    role?: UserRole;
    estado?: UserStatus;
    search?: string;
  }): Promise<User[]> {
    let query = this.db.from("users").select("*");

    if (filter?.role) {
      query = query.eq("role", filter.role);
    }
    if (filter?.estado) {
      query = query.eq("estado", filter.estado);
    }
    if (filter?.search) {
      query = query.or(
        `nombre.ilike.%${filter.search}%,email.ilike.%${filter.search}%,nombre_negocio.ilike.%${filter.search}%`
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error)
      throw new Error(`Error al listar usuarios: ${error.message}`);
    return (data || []) as User[];
  }
}
