import test from "node:test";
import assert from "node:assert/strict";
import { KaiBrain } from "../src/index.js";
import { AGENTS } from "../src/core/agents.js";

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
