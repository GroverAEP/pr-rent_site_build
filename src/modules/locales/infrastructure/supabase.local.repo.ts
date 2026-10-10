import { getSupabaseServiceClient } from "@/shared/db/supabase.driver";
import {
  Local,
  ILocalRepository,
  LocalSearchFilter,
  LocalCaracteristicas,
  TourConfig,
  Operacion,
  Moneda,
  LocalStatus,
} from "../domain/local.entity";

// Supabase JSONB comes already parsed as objects, no need for JSON.parse
function rowToEntity(row: Record<string, unknown>): Local {
  return {
    id: row.id as string,
    owner_id: row.owner_id as string,
    slug: row.slug as string,
    titulo: row.titulo as string,
    operacion: row.operacion as Operacion,
    precio: Number(row.precio),
    moneda: row.moneda as Moneda,
    area_m2: Number(row.area_m2),
    direccion: row.direccion as string,
    distrito: row.distrito as string,
    ciudad: row.ciudad as string,
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    descripcion: row.descripcion as string,
    caracteristicas: (row.caracteristicas || {}) as LocalCaracteristicas,
    rubros_sugeridos: (row.rubros_sugeridos || []) as string[],
    estado: row.estado as LocalStatus,
    portada_url: row.portada_url as string,
    tour_config: (row.tour_config || {}) as TourConfig,
    tour_glb_url: (row.tour_glb_url as string) || null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export class SupabaseLocalRepository implements ILocalRepository {
  private get db() {
    return getSupabaseServiceClient();
  }

  async findById(id: string): Promise<Local | null> {
    const { data, error } = await this.db
      .from("locales")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return rowToEntity(data);
  }

  async findBySlug(slug: string): Promise<Local | null> {
    const { data, error } = await this.db
      .from("locales")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    return rowToEntity(data);
  }

  async findByOwnerId(ownerId: string): Promise<Local[]> {
    const { data, error } = await this.db
      .from("locales")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Error al buscar locales: ${error.message}`);
    return (data || []).map(rowToEntity);
  }

  async create(local: Omit<Local, "created_at" | "updated_at">): Promise<Local> {
    const now = new Date().toISOString();
    const { id: suppliedId, ...localFields } = local;
    void suppliedId;
    const row = {
      ...localFields,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await this.db
      .from("locales")
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`Error al crear local: ${error.message}`);
    return rowToEntity(data);
  }

  async update(id: string, partial: Partial<Omit<Local, "id">>): Promise<Local> {
    const current = await this.findById(id);
    if (!current) throw new Error(`Local con id ${id} no encontrado.`);

    const updateData = {
      ...partial,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    );

    const { data, error } = await this.db
      .from("locales")
      .update(cleanData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar local: ${error.message}`);
    return rowToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error, count } = await this.db
      .from("locales")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) return false;
    return (count ?? 0) > 0;
  }

  async search(
    filter?: LocalSearchFilter
  ): Promise<{ items: Local[]; total: number }> {
    // Count query
    let countQuery = this.db
      .from("locales")
      .select("*", { count: "exact", head: true });

    // Data query
    let dataQuery = this.db.from("locales").select("*");

    // Apply filters to both
    if (filter?.operacion) {
      countQuery = countQuery.eq("operacion", filter.operacion);
      dataQuery = dataQuery.eq("operacion", filter.operacion);
    }
    if (filter?.distrito && filter.distrito !== "todos") {
      countQuery = countQuery.eq("distrito", filter.distrito);
      dataQuery = dataQuery.eq("distrito", filter.distrito);
    }
    if (filter?.estado) {
      countQuery = countQuery.eq("estado", filter.estado);
      dataQuery = dataQuery.eq("estado", filter.estado);
    }
    if (filter?.owner_id) {
      countQuery = countQuery.eq("owner_id", filter.owner_id);
      dataQuery = dataQuery.eq("owner_id", filter.owner_id);
    }
    if (filter?.minPrecio !== undefined) {
      countQuery = countQuery.gte("precio", filter.minPrecio);
      dataQuery = dataQuery.gte("precio", filter.minPrecio);
    }
    if (filter?.maxPrecio !== undefined) {
      countQuery = countQuery.lte("precio", filter.maxPrecio);
      dataQuery = dataQuery.lte("precio", filter.maxPrecio);
    }
    if (filter?.minArea !== undefined) {
      countQuery = countQuery.gte("area_m2", filter.minArea);
      dataQuery = dataQuery.gte("area_m2", filter.minArea);
    }
    if (filter?.maxArea !== undefined) {
      countQuery = countQuery.lte("area_m2", filter.maxArea);
      dataQuery = dataQuery.lte("area_m2", filter.maxArea);
    }
    if (filter?.search) {
      const searchFilter = `titulo.ilike.%${filter.search}%,descripcion.ilike.%${filter.search}%,direccion.ilike.%${filter.search}%,distrito.ilike.%${filter.search}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    // Ordering
    if (filter?.orderBy === "precio_asc") {
      dataQuery = dataQuery.order("precio", { ascending: true });
    } else if (filter?.orderBy === "precio_desc") {
      dataQuery = dataQuery.order("precio", { ascending: false });
    } else if (filter?.orderBy === "area_desc") {
      dataQuery = dataQuery.order("area_m2", { ascending: false });
    } else {
      dataQuery = dataQuery.order("created_at", { ascending: false });
    }

    // Pagination
    const limit = filter?.limit ?? 20;
    const offset = filter?.offset ?? 0;
    dataQuery = dataQuery.range(offset, offset + limit - 1);

    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (error) throw new Error(`Error en búsqueda: ${error.message}`);

    return {
      items: (data || []).map(rowToEntity),
      total: count ?? 0,
    };
  }
}
