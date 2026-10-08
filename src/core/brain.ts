import { AGENTS } from "./agents.js";
import { JobManager } from "./jobs.js";
import { InMemoryStore } from "./memory.js";
import { planRequest } from "./router.js";
import type { BrainRequest, BrainResponse, MemoryStore, ModelAdapter } from "./types.js";

export class KaiBrain {
  private readonly memory: MemoryStore;
  private readonly jobs: JobManager;

  constructor(private readonly model?: ModelAdapter, memory?: MemoryStore, jobs?: JobManager) {
    this.memory = memory ?? new InMemoryStore();
    this.jobs = jobs ?? new JobManager();
  }

  async think(request: BrainRequest): Promise<BrainResponse> {
    const plan = planRequest(request);
    const agent = AGENTS[plan.character];

    await this.memory.set(request.userId, "last_character", plan.character);
    await this.memory.set(request.userId, "last_task_kind", plan.kind);

    const job = this.jobs.create(request.userId, plan);

    if (!this.model) {
      return {
        plan,
        reply: this.fallbackReply(agent.name, plan.kind, job.id)
      };
    }

    const previousTask = await this.memory.get(request.userId, "last_task_kind");
    const reply = await this.model.generate({
      system: [
        "You are the Kai Brain Core.",
        \`You are routing this request to \${agent.name}.\`,
        \`Agent mission: \${agent.mission}\`,
        \`Task type: \${plan.kind}\`,
        \`Available planned tools: \${plan.tools.join(", ") || "none"}\`,
        \`Previous task type: \${previousTask ?? "none"}\`,
        "Never claim a tool ran or work completed unless the execution system confirms it.",
        "If a task requires background work, explain that it is queued/working rather than pretending it is finished."
      ].join("\\n"),
      message: request.message
    });

    return { plan, reply };
  }

  getJob(id: string) {
    return this.jobs.get(id);
  }

  private fallbackReply(agentName: string, kind: string, jobId: string): string {
    return \`Routed to \${agentName} for a \${kind} task. Job \${jobId} has been created. No AI model or creation tool is connected yet, so no work is being falsely reported as completed.\`;
  }
}
