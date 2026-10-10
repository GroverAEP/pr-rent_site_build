import { getSupabaseServiceClient } from "@/shared/db/supabase.driver";
import { Lead, ILeadRepository, LeadOrigin } from "../domain/lead.entity";

export class SupabaseLeadRepository implements ILeadRepository {
  private get db() {
    return getSupabaseServiceClient();
  }

  async create(lead: Omit<Lead, "created_at">): Promise<Lead> {
    const now = new Date().toISOString();
    const { id: suppliedId, ...leadFields } = lead;
    void suppliedId;
    const row = { ...leadFields, created_at: now };

    const { data, error } = await this.db
      .from("leads")
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`Error al crear lead: ${error.message}`);
    return {
      id: data.id,
      local_id: data.local_id,
      origen: data.origen as LeadOrigin,
      user_agent_hash: data.user_agent_hash,
      ip_hash: data.ip_hash,
      created_at: data.created_at,
    };
  }

  async countByLocalId(localId: string): Promise<number> {
    const { count, error } = await this.db
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("local_id", localId);
    if (error) return 0;
    return count ?? 0;
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    // Supabase doesn't support JOINs in the PostgREST query API,
    // so we first get the local IDs for this owner, then count leads.
    const { data: locales, error: localesError } = await this.db
      .from("locales")
      .select("id")
      .eq("owner_id", ownerId);

    if (localesError || !locales || locales.length === 0) return 0;

    const localIds = locales.map((l: { id: string }) => l.id);

    const { count, error } = await this.db
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("local_id", localIds);

    if (error) return 0;
    return count ?? 0;
  }

  async getRecentByLocalId(localId: string, limit = 10): Promise<Lead[]> {
    const { data, error } = await this.db
      .from("leads")
      .select("*")
      .eq("local_id", localId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Error al obtener leads: ${error.message}`);
    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      local_id: row.local_id as string,
      origen: row.origen as LeadOrigin,
      user_agent_hash: row.user_agent_hash as string,
      ip_hash: row.ip_hash as string,
      created_at: row.created_at as string,
    }));
  }

  async getStatsSummary(): Promise<{ totalLeads: number; last7Days: number }> {
    const { count: totalLeads } = await this.db
      .from("leads")
      .select("*", { count: "exact", head: true });

    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { count: last7Days } = await this.db
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    return {
      totalLeads: totalLeads ?? 0,
      last7Days: last7Days ?? 0,
    };
  }
}
