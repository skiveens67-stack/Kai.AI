import { planRequest } from "./router.js";
import type { BrainRequest, BrainResponse, ModelAdapter } from "./types.js";

export class KaiBrain {
  constructor(private readonly model?: ModelAdapter) {}

  async think(request: BrainRequest): Promise<BrainResponse> {
    const plan = planRequest(request);
    if (!this.model) {
      return {
        plan,
        reply: plan.requiresBackgroundJob
          ? \`I understand the \${plan.kind} request. I would create a background project job, execute the planned steps, test the result, and report the real status.\`
          : \`I understand your request and routed it to \${plan.character}.\`
      };
    }
    const reply = await this.model.generate({
      system: "You are the Kai Brain Core. Never claim work is complete unless a tool actually completed it. Use the supplied plan as routing context. Be concise, helpful, and honest about status.",
      message: request.message
    });
    return { plan, reply };
  }
}
