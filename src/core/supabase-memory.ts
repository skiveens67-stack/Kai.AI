import type { MemoryStore } from "./types.js";

type SupabaseMemoryEnv = { url: string; serviceRoleKey: string };
type MemoryRow = { value: string };

/** Server-only Supabase REST adapter. Never expose its service-role key to a browser. */
export class SupabaseMemoryStore implements MemoryStore {
  private readonly baseUrl: string;
  constructor(private readonly env: SupabaseMemoryEnv, private readonly fetcher: typeof fetch = fetch) {
    this.baseUrl = env.url.replace(/\\/+$/, "");
    if (!this.baseUrl || !env.serviceRoleKey) throw new Error("Supabase memory credentials are missing.");
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    const response = await this.fetcher(`${this.baseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.env.serviceRoleKey,
        authorization: `Bearer ${this.env.serviceRoleKey}`,
        "content-type": "application/json",
        ...(init.headers ?? {})
      }
    });
    if (!response.ok) throw new Error(`Supabase memory request failed (${response.status}).`);
    return response;
  }

  async get(userId: string, key: string): Promise<string | null> {
    const query = new URLSearchParams({ select: "value", user_id: `eq.${userId}`, memory_key: `eq.${key}`, limit: "1" });
    const response = await this.request(`kai_brain_memory?${query.toString()}`);
    const rows = await response.json() as MemoryRow[];
    return rows[0]?.value ?? null;
  }

  async set(userId: string, key: string, value: string): Promise<void> {
    await this.request("kai_brain_memory?on_conflict=user_id,memory_key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: userId, memory_key: key, value, updated_at: new Date().toISOString() })
    });
  }

  async append(userId: string, key: string, value: string): Promise<void> {
    await this.request("kai_brain_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: userId, memory_key: key, value })
    });
  }

  async list(userId: string, key: string, limit = 8): Promise<string[]> {
    const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
    const query = new URLSearchParams({
      select: "value", user_id: `eq.${userId}`, memory_key: `eq.${key}`,
      order: "created_at.desc,id.desc", limit: String(safeLimit)
    });
    const response = await this.request(`kai_brain_events?${query.toString()}`);
    const rows = await response.json() as MemoryRow[];
    return rows.map(row => row.value).reverse();
  }
}
