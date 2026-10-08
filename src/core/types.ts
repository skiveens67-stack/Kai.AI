export type CharacterId = "kai" | "lily" | "cookie" | "jake";
export type TaskKind = "chat" | "game" | "website" | "app" | "image" | "video" | "code" | "security" | "school" | "cooking" | "diy" | "unknown";

export interface BrainRequest { userId: string; message: string; projectId?: string; conversationId?: string; }
export interface BrainPlan { character: CharacterId; kind: TaskKind; goal: string; steps: string[]; tools: string[]; requiresBackgroundJob: boolean; confidence: number; }
export interface BrainResponse { plan: BrainPlan; reply: string; jobId?: string; }
export interface MemoryStore {
  get(userId: string, key: string): Promise<string | null>;
  set(userId: string, key: string, value: string): Promise<void>;
  append?(userId: string, key: string, value: string): Promise<void>;
  list?(userId: string, key: string, limit?: number): Promise<string[]>;
}
export interface ModelAdapter {
  generate(input: { system: string; message: string; context?: string }): Promise<string>;
}