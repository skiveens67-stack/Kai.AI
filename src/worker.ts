import { KaiBrain } from "./core/brain.js";
import { CloudflareWorkersAIAdapter, type WorkersAIChatBinding } from "./core/cloudflare-workers-ai.js";
import { SupabaseMemoryStore } from "./core/supabase-memory.js";

interface Env {
  AI: WorkersAIChatBinding;
  KAI_AI_MODEL?: string;
  KAI_ALLOWED_ORIGIN?: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}
type AuthUser = { id?: unknown };

function json(body: unknown, status = 200, origin = ""): Response {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "vary": "Origin"
  };
  if (origin) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-headers"] = "authorization, content-type";
    headers["access-control-allow-methods"] = "POST, OPTIONS";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("origin") ?? "";
    const allowedOrigin = env.KAI_ALLOWED_ORIGIN ?? "";
    if (origin && origin !== allowedOrigin) return json({ error: "Origin not allowed." }, 403);
    if (request.method === "OPTIONS") {
      if (!allowedOrigin) return json({ error: "CORS origin is not configured." }, 503);
      return new Response(null, { status: 204, headers: {
        "access-control-allow-origin": allowedOrigin,
        "access-control-allow-headers": "authorization, content-type",
        "access-control-allow-methods": "POST, OPTIONS", "access-control-max-age": "86400", vary: "Origin"
      } });
    }
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, origin);
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Server memory/auth configuration is missing." }, 503, origin);
    }
    const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Sign in to use Kai." }, 401, origin);

    let userId: string;
    try {
      const authResponse = await fetch(`${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1/user`, {
        headers: { apikey: env.SUPABASE_ANON_KEY, authorization: `Bearer ${token}` },
      });
      if (!authResponse.ok) return json({ error: "Your session is invalid or expired. Please sign in again." }, 401, origin);
      const user = await authResponse.json() as AuthUser;
      if (typeof user.id !== "string" || !user.id) return json({ error: "Could not verify your account." }, 401, origin);
      userId = user.id;
    } catch { return json({ error: "Could not verify your account." }, 502, origin); }

    let body: { message?: unknown };
    try { body = await request.json() as { message?: unknown }; }
    catch { return json({ error: "Request body must be valid JSON." }, 400, origin); }
    if (typeof body.message !== "string" || !body.message.trim() || body.message.length > 8000) {
      return json({ error: "Message must contain 1–8000 characters." }, 400, origin);
    }

    try {
      const model = new CloudflareWorkersAIAdapter(env.AI, env.KAI_AI_MODEL || "@cf/meta/llama-3.1-8b-instruct");
      const memory = new SupabaseMemoryStore({ url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY });
      const brain = new KaiBrain(model, memory);
      const result = await brain.think({ userId, message: body.message.trim() });
      return json({ ok: true, ...result }, 200, origin);
    } catch {
      return json({ error: "Kai could not complete the request. Check model and memory configuration." }, 502, origin);
    }
  }
};
