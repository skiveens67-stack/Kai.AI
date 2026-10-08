import type { ModelAdapter } from "./types.js";

/**
 * Minimal Cloudflare Workers AI binding contract.
 * Bind AI in the Worker configuration and choose a supported chat model
 * with KAI_AI_MODEL. No provider key is embedded in source code.
 */
export interface WorkersAIChatBinding {
  run(
    model: string,
    input: {
      messages: Array<{ role: "system" | "user"; content: string }>;
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<unknown>;
}

function extractText(result: unknown): string {
  if (typeof result === "string") return result.trim();
  if (!result || typeof result !== "object") {
    throw new Error("The AI model returned an empty or unsupported response.");
  }
  const value = result as { response?: unknown; output_text?: unknown };
  const text = typeof value.response === "string"
    ? value.response
    : typeof value.output_text === "string"
      ? value.output_text
      : "";
  if (!text.trim()) throw new Error("The AI model returned no text response.");
  return text.trim();
}

/** Connects KaiBrain ModelAdapter to a Cloudflare Workers AI binding. */
export class CloudflareWorkersAIAdapter implements ModelAdapter {
  constructor(
    private readonly ai: WorkersAIChatBinding,
    private readonly model = "@cf/meta/llama-3.1-8b-instruct"
  ) {
    if (!model.trim()) throw new Error("A Cloudflare AI model name is required.");
  }

  async generate(input: { system: string; message: string; context?: string }): Promise<string> {
    const context = input.context?.trim();
    const userMessage = context
      ? `Recent conversation context (may be incomplete):\n${context}\n\nCurrent user request:\n${input.message}`
      : input.message;
    const result = await this.ai.run(this.model, {
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: userMessage }
      ],
      temperature: 0.4,
      max_tokens: 1200
    });
    return extractText(result);
  }
}
