export interface BrainTool {
  name: string;
  description: string;
  execute(input: unknown): Promise<unknown>;
}

export class ToolRegistry {
  private readonly tools = new Map<string, BrainTool>();

  register(tool: BrainTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): BrainTool | null {
    return this.tools.get(name) ?? null;
  }

  list(): BrainTool[] {
    return [...this.tools.values()];
  }
}
