import type { MemoryStore } from "./types.js";

export class InMemoryStore implements MemoryStore {
  private readonly data = new Map<string, Map<string, string>>();

  async get(userId: string, key: string): Promise<string | null> {
    return this.data.get(userId)?.get(key) ?? null;
  }

  async set(userId: string, key: string, value: string): Promise<void> {
    let user = this.data.get(userId);
    if (!user) {
      user = new Map<string, string>();
      this.data.set(userId, user);
    }
    user.set(key, value);
  }
}
