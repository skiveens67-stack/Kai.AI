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
