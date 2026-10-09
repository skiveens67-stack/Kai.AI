import test from "node:test";
import assert from "node:assert/strict";
import { KaiBrain } from "../src/index.js";
import { AGENTS } from "../src/core/agents.js";
import worker from "../src/worker.js";

test("routes a game request to Jake and creates background work", async () => {
  const brain = new KaiBrain();
  const result = await brain.think({ userId: "demo", message: "Make me a Roblox game with bosses." });
  assert.equal(result.plan.character, "jake");
  assert.equal(result.plan.kind, "game");
  assert.equal(result.plan.requiresBackgroundJob, true);
  const id = result.reply.match(/Job ([a-f0-9-]+)/)?.[1];
  assert.ok(id);
  assert.equal(brain.getJob(id!)?.status, "queued");
});

test("the shared brain honors explicit character requests", async () => {
  const brain = new KaiBrain();
  const cases = [
    { character: "kai", message: "Kai, help me plan a project." },
    { character: "lily", message: "Lily, help me study for school." },
    { character: "jake", message: "Jake, design a game boss." },
    { character: "cookie", message: "Cookie, check this message for scams." }
  ] as const;
  for (const item of cases) {
    const result = await brain.think({ userId: "character-test", message: item.message });
    assert.equal(result.plan.character, item.character);
  }
});

test("all four family agents have distinct missions, personas, and safety guidance", () => {
  const agents = Object.values(AGENTS);
  assert.equal(agents.length, 4);
  assert.equal(new Set(agents.map(agent => agent.name)).size, 4);
  assert.equal(new Set(agents.map(agent => agent.mission)).size, 4);
  for (const agent of agents) {
    assert.ok(agent.persona.trim().length > 40);
    assert.ok(agent.specialties.length > 0);
  }
  assert.match(AGENTS.kai.persona, /Never say work is complete/i);
  assert.match(AGENTS.lily.persona, /licensed therapist or clinician/i);
  assert.match(AGENTS.cookie.persona, /breaking into accounts/i);
  assert.match(AGENTS.jake.persona, /play-tested/i);
});

test("health endpoint reports service identity without requiring user authentication", async () => {
  const response = await worker.fetch(new Request("https://kai-brain-core.example/health"), {} as never);
  assert.equal(response.status, 200);
  const body = await response.json() as { ok: boolean; service: string };
  assert.equal(body.ok, true);
  assert.equal(body.service, "kai-brain-core");
});

test("character endpoint exposes only public agent metadata", async () => {
  const response = await worker.fetch(new Request("https://kai-brain-core.example/characters"), {} as never);
  assert.equal(response.status, 200);
  const body = await response.json() as { characters: Array<{ id: string; name: string }> };
  assert.deepEqual(body.characters.map(item => item.id).sort(), ["cookie", "jake", "kai", "lily"]);
});

test("chat endpoint requires authentication after configuration is present", async () => {
  const env = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "public-test-key",
    SUPABASE_SERVICE_ROLE_KEY: "test-only-not-a-real-secret",
    KAI_ALLOWED_ORIGIN: "https://kai-ai.higgsfield.app",
    AI: {}
  };
  const response = await worker.fetch(new Request("https://kai-brain-core.example/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "hello" })
  }), env as never);
  assert.equal(response.status, 401);
});

test("rejects browser requests from origins outside the allowlist", async () => {
  const response = await worker.fetch(new Request("https://kai-brain-core.example/health", {
    headers: { origin: "https://not-kai.example" }
  }), { KAI_ALLOWED_ORIGIN: "https://kai-ai.higgsfield.app" } as never);
  assert.equal(response.status, 403);
});
