# Kai.AI Brain Core

Kai's server-side Brain Core routes requests to the Kai Family, calls a hosted language model through Cloudflare Workers AI, and persists explicit preferences and conversation history in Supabase.

## Deployment requirements

1. In Cloudflare, open **Workers & Pages** and select the `kai-brain-core` Worker after its first deployment.
2. Configure the Workers AI binding named `AI` (also defined in `wrangler.toml`).
3. Set the Supabase service-role key as a **Worker secret**. Get it from the Supabase project's API settings, then run `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY` from this repository and paste it only into the terminal prompt. Never commit this key or put it in browser code.
4. Deploy from the repository root with `npx wrangler deploy`.
5. Verify the Worker has its `AI` binding, the `SUPABASE_SERVICE_ROLE_KEY` secret, and the variables in `wrangler.toml`.
6. Call the endpoint with `POST` and a valid Supabase Auth access token in `Authorization: Bearer <access-token>`, with JSON body `{"message":"Hello Kai"}`. The Worker verifies the token with Supabase and derives the user ID from the verified account; callers cannot choose another user's memory ID.

## Persistent memory

- `kai_brain_memory`: latest saved values such as task context and explicitly stated preferences.
- `kai_brain_events`: append-only conversation entries used as recent context.
- Both tables have Row Level Security enabled and do not grant direct access to `anon` or `authenticated`; the service key is only used server-side.

## Learning behavior

The current learning layer remembers explicit instructions and preferences such as “remember that…”, “I prefer…”, and “never use…”. It avoids saving obvious password/API-key secrets and caps saved facts. This is persistent contextual memory, not automatic retraining of the underlying model.

## Status

The source code and database schema are in place. A successful production deployment and a real authenticated model-response test are still required before calling live AI complete.
