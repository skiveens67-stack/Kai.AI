export type CharacterId = "kai" | "lily" | "cookie" | "jake";
export type TaskKind = "chat" | "game" | "website" | "app" | "image" | "video" | "code" | "security" | "school" | "cooking" | "diy" | "unknown";

export interface BrainRequest {
  userId: string;
  message: string;
  projectId?: string;
  conversationId?: string;
}

export interface BrainPlan {
  character: CharacterId;
  kind: TaskKind;
  goal: string;
  steps: string[];
  tools: string[];
  requiresBackgroundJob: boolean;
}

export interface BrainResponse {
  plan: BrainPlan;
  reply: string;
}

export interface MemoryStore {
  get(userId: string, key: string): Promise<string | null>;
  set(userId: string, key: string, value: string): Promise<void>;
}

export interface ModelAdapter {
  generate(input: { system: string; message: string }): Promise<string>;
}
