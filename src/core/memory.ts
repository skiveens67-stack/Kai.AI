import type { MemoryStore } from "./types.js";

export class InMemoryStore implements MemoryStore {
  private readonly data = new Map<string, Map<string, string>>();
  private readonly lists = new Map<string, Map<string, string[]>>();

  async get(userId: string, key: string): Promise<string | null> { return this.data.get(userId)?.get(key) ?? null; }
  async set(userId: string, key: string, value: string): Promise<void> {
    let user = this.data.get(userId); if (!user) { user = new Map(); this.data.set(userId, user); } user.set(key, value);
  }
  async append(userId: string, key: string, value: string): Promise<void> {
    let user = this.lists.get(userId); if (!user) { user = new Map(); this.lists.set(userId, user); }
    const values = user.get(key) ?? []; values.push(value); user.set(key, values);
  }
  async list(userId: string, key: string, limit = 20): Promise<string[]> {
    const values = this.lists.get(userId)?.get(key) ?? []; return values.slice(Math.max(0, values.length - limit));
  }
}