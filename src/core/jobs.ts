import type { BrainPlan } from "./types.js";

export type JobStatus = "queued" | "planning" | "working" | "testing" | "completed" | "failed";

export interface BrainJob {
  id: string;
  userId: string;
  plan: BrainPlan;
  status: JobStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export class JobManager {
  private readonly jobs = new Map<string, BrainJob>();

  create(userId: string, plan: BrainPlan): BrainJob {
    const now = new Date().toISOString();
    const job: BrainJob = {
      id: crypto.randomUUID(),
      userId,
      plan,
      status: plan.requiresBackgroundJob ? "queued" : "completed",
      progress: plan.requiresBackgroundJob ? 0 : 100,
      createdAt: now,
      updatedAt: now
    };
    this.jobs.set(job.id, job);
    return job;
  }

  update(id: string, status: JobStatus, progress: number, error?: string): BrainJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;
    job.status = status;
    job.progress = Math.max(0, Math.min(100, progress));
    job.updatedAt = new Date().toISOString();
    if (error) job.error = error;
    return job;
  }

  get(id: string): BrainJob | null {
    return this.jobs.get(id) ?? null;
  }
}
