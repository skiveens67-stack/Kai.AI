import { KaiBrain } from "./core/brain.js";
import { CloudflareWorkersAIAdapter, type WorkersAIChatBinding } from "./core/cloudflare-workers-ai.js";

interface Env {
  AI: WorkersAIChatBinding;
  KAI_API_SECRET: string;
  KAI_AI_MODEL?: string;
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
    if (!env.KAI_API_SECRET) return json({ error: "Server authentication is not configured." }, 503);
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
      const brain = new KaiBrain(model);
      const result = await brain.think({ userId: body.userId.trim(), message: body.message.trim() });
      return json({ ok: true, ...result });
    } catch {
      return json({ error: "Kai could not complete the request. Check the model binding and server logs." }, 502);
    }
  }
};
