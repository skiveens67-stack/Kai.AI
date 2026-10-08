import type { BrainPlan, BrainRequest, CharacterId, TaskKind } from "./types.js";

const rules: Array<{ kind: TaskKind; words: string[]; character: CharacterId }> = [
  { kind:"game", words:["game","roblox","boss","level","npc","weapon"], character:"jake" },
  { kind:"website", words:["website","web site","webpage"], character:"kai" },
  { kind:"app", words:["app","application","mobile app"], character:"kai" },
  { kind:"image", words:["image","picture","draw","logo","art"], character:"kai" },
  { kind:"video", words:["video","animation","trailer"], character:"jake" },
  { kind:"security", words:["hack","scam","security","password","phishing"], character:"cookie" },
  { kind:"cooking", words:["cook","recipe","dinner","food"], character:"lily" },
  { kind:"school", words:["homework","lesson","school","study"], character:"lily" },
  { kind:"diy", words:["build","fix","diy","repair"], character:"lily" },
  { kind:"code", words:["code","coding","program","script"], character:"kai" }
];

export function classify(message: string): { kind: TaskKind; character: CharacterId } {
  const text = message.toLowerCase();
  const hit = rules.find(rule => rule.words.some(word => text.includes(word)));
  return hit ? { kind: hit.kind, character: hit.character } : { kind:"chat", character:"kai" };
}

export function planRequest(request: BrainRequest): BrainPlan {
  const { kind, character } = classify(request.message);
  const backgroundKinds = new Set<TaskKind>(["game","website","app","video"]);
  const steps = kind === "chat"
    ? ["Understand the user's request","Generate a helpful response"]
    : ["Understand and validate the request","Create a project plan","Select required tools","Execute the work","Test the result","Return the real status"];
  return {
    character, kind, goal: request.message.trim(), steps,
    tools: toolsFor(kind),
    requiresBackgroundJob: backgroundKinds.has(kind)
  };
}

function toolsFor(kind: TaskKind): string[] {
  switch (kind) {
    case "game": return ["project","code","assets","animation","test_lab"];
    case "website": return ["project","code","preview","test_lab"];
    case "app": return ["project","code","build","test_lab"];
    case "image": return ["image_generation"];
    case "video": return ["video_generation","assets"];
    case "security": return ["security_scan","moderation"];
    case "code": return ["code","test_lab"];
    default: return [];
  }
}
