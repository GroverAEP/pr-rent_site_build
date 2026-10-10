import { getSupabaseServiceClient } from "@/shared/db/supabase.driver";
import { MediaItem, IMediaRepository, MediaType } from "../domain/media.entity";

export class SupabaseMediaRepository implements IMediaRepository {
  private get db() {
    return getSupabaseServiceClient();
  }

  async findByLocalId(localId: string): Promise<MediaItem[]> {
    const { data, error } = await this.db
      .from("media")
      .select("*")
      .eq("local_id", localId)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Error al obtener medios: ${error.message}`);
    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      local_id: row.local_id as string,
      tipo: row.tipo as MediaType,
      url: row.url as string,
      orden: row.orden as number,
      created_at: row.created_at as string,
    }));
  }

  async create(item: Omit<MediaItem, "created_at">): Promise<MediaItem> {
    const now = new Date().toISOString();
    const { id: suppliedId, ...mediaFields } = item;
    void suppliedId;
    const row = { ...mediaFields, created_at: now };

    const { data, error } = await this.db
      .from("media")
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`Error al crear medio: ${error.message}`);
    return {
      id: data.id,
      local_id: data.local_id,
      tipo: data.tipo as MediaType,
      url: data.url,
      orden: data.orden,
      created_at: data.created_at,
    };
  }

  async delete(id: string): Promise<boolean> {
    const { error, count } = await this.db
      .from("media")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) return false;
    return (count ?? 0) > 0;
  }
}
