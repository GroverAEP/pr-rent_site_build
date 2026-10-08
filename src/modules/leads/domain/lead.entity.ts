export type LeadOrigin = "detalle" | "tour3d" | "listado";

export interface Lead {
  id: string;
  local_id: string;
  origen: LeadOrigin;
  user_agent_hash: string;
  ip_hash: string;
  created_at: string;
}

export interface ILeadRepository {
  create(lead: Omit<Lead, "created_at">): Promise<Lead>;
  countByLocalId(localId: string): Promise<number>;
  countByOwnerId(ownerId: string): Promise<number>;
  getRecentByLocalId(localId: string, limit?: number): Promise<Lead[]>;
  getStatsSummary(): Promise<{ totalLeads: number; last7Days: number }>;
}
