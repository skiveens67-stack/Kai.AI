import { KaiBrain } from "./core/brain.js";
import { CloudflareWorkersAIAdapter, type WorkersAIChatBinding } from "./core/cloudflare-workers-ai.js";
import { SupabaseMemoryStore } from "./core/supabase-memory.js";

interface Env {
  AI: WorkersAIChatBinding;
  KAI_API_SECRET: string;
  KAI_AI_MODEL?: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return json({ error: "Use POST." }, 405);
    if (!env.KAI_API_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Server secrets are not configured." }, 503);
    }
    const authorization = request.headers.get("authorization") ?? "";
    if (authorization !== `Bearer ${env.KAI_API_SECRET}`) return json({ error: "Unauthorized." }, 401);

    let body: { userId?: unknown; message?: unknown };
    try { body = await request.json() as { userId?: unknown; message?: unknown }; }
    catch { return json({ error: "Request body must be valid JSON." }, 400); }
    if (typeof body.userId !== "string" || !body.userId.trim() || body.userId.length > 128) {
      return json({ error: "A valid userId is required." }, 400);
    }
    if (typeof body.message !== "string" || !body.message.trim() || body.message.length > 8000) {
      return json({ error: "Message must contain 1–8000 characters." }, 400);
    }

    try {
      const model = new CloudflareWorkersAIAdapter(env.AI, env.KAI_AI_MODEL || "@cf/meta/llama-3.1-8b-instruct");
      const memory = new SupabaseMemoryStore({ url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY });
      const brain = new KaiBrain(model, memory);
      const result = await brain.think({ userId: body.userId.trim(), message: body.message.trim() });
      return json({ ok: true, ...result });
    } catch {
      return json({ error: "Kai could not complete the request. Check model and memory configuration." }, 502);
    }
  }
};
