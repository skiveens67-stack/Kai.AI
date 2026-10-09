# Kai.AI Brain Core

Kai's server-side Brain Core routes requests to Kai.AI, Lily.AI, Jake.AI, and Cookie.AI, calls Cloudflare Workers AI, and can persist explicitly saved preferences and recent conversation history in Supabase.

## API endpoints

- `GET /health`: minimal service health response.
- `GET /characters`: public metadata for the four Kai family agents.
- `POST /`: authenticated chat request; requires a valid Supabase Auth access token and JSON body `{"message":"Hello Kai"}`.

The browser origin is restricted by `KAI_ALLOWED_ORIGIN`. A successful health response only confirms the Worker responds; it does not prove AI, email, or payments are fully operational.

## Deployment requirements

1. In Cloudflare, open **Workers & Pages** and select the `kai-brain-core` Worker.
2. Configure the Workers AI binding named `AI` (also defined in `wrangler.toml`).
3. Set the Supabase service-role key as a **Worker secret** named `SUPABASE_SERVICE_ROLE_KEY`. Get it from the Supabase project's API settings, then run `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY` from this repository and paste it only into the terminal prompt. Never commit this key or put it in browser code.
4. Configure GitHub Actions repository secrets `CLOUDFLARE_API_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` before using the deploy workflow.
5. Deploy from the repository root with `npm run typecheck`, `npm test`, and `npx wrangler deploy`.
6. Verify the Worker has its `AI` binding, the `SUPABASE_SERVICE_ROLE_KEY` secret, and the variables in `wrangler.toml`.
7. For chat, send a valid Supabase Auth access token in `Authorization: Bearer <access-token>`. The Worker verifies the token with Supabase and derives the user ID from the verified account; callers cannot choose another user's memory ID.

## Character agents

- **Kai.AI**: main architect and orchestrator for conversation, planning, coding, and creation.
- **Lily.AI**: creative and learning companion; does not claim to be a licensed therapist or clinician.
- **Cookie.AI**: safety and security guardian, scam-detection helper, and general pet-care guide.
- **Jake.AI**: game creation specialist for characters, worlds, gameplay, assets, and animation direction.

The shared Brain prompt includes each agent's persona and safety boundaries. It instructs the model not to claim tools ran or work completed unless the execution system confirms it.

## Supabase platform foundations

The database contains Row-Level Security (RLS)-enabled tables for:

- user consents, profiles, creation jobs, persistent Brain memory and events;
- subscription records, promotion orders, payment event idempotency, marketplace listings and purchases;
- AI credit accounts and a credit ledger;
- family character definitions, chat conversations and messages;
- community spaces and memberships, social post drafts, moderation reports, appeals, notifications, support tickets, and security events;
- auto-post jobs, transfer requests, game play-test runs, creator attribution removal orders, view metrics, and creator earnings.

These are **database foundations**, not proof that each product feature has a finished user interface or live integration. Sensitive payment/earnings/view-event tables are not directly writable by signed-in clients; trusted server-side handlers must update payment status and financial records. Client-created social posts and marketplace listings begin as drafts and require a trusted moderation/publishing path.

## Persistent memory

- `kai_brain_memory`: saved values such as task context and explicitly stated preferences.
- `kai_brain_events`: append-only conversation entries used as recent context.
- Row Level Security is enabled. The Worker uses its service-role key only server-side; do not expose it to browser code.

Persistent contextual memory is not automatic retraining of the underlying model.

## Transactional email status

Resend currently contains draft templates for account verification, password reset, welcome messages, security alerts, payment receipts, creation-complete notifications, and creator payout updates. They are not published or connected to Supabase Auth. No sending domain is configured, so production email delivery is not ready. After a domain is owned and verified, configure Resend DNS, connect the provider to Supabase Auth SMTP, set the correct confirmation/reset redirect URLs, publish and test templates, and verify actual delivery before enabling real signups.

## Payment status

Database records are prepared for subscriptions, $25+ promotion orders, marketplace purchases, payment webhook idempotency, transfer requests, and creator earnings. These records do not move money by themselves. A production payment flow still needs Stripe Checkout/Billing/Connect setup, verified webhooks, reconciliation, refunds/disputes, seller onboarding, and any required legal/compliance review. Do not describe internal balances or transfer requests as a live bank or money-transfer service.

## Status

Source and schema foundations are in progress. A successful current production deployment, real authenticated model-response test, working transactional email delivery, and end-to-end payment tests are still required before calling Kai.AI complete.
