import test from "node:test";
import assert from "node:assert/strict";
import { KaiBrain } from "../src/index.js";

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
