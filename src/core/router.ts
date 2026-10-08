import type { BrainPlan, BrainRequest, CharacterId, TaskKind } from "./types.js";

const rules: Array<{ kind: TaskKind; words: string[]; character: CharacterId }> = [
  { kind:"game", words:["game","roblox","boss","level","npc","weapon","fruit"], character:"jake" },
  { kind:"website", words:["website","web site","webpage","landing page"], character:"kai" },
  { kind:"app", words:["app","application","mobile app"], character:"kai" },
  { kind:"image", words:["image","picture","draw","logo","art","photo"], character:"kai" },
  { kind:"video", words:["video","animation","trailer","film"], character:"jake" },
  { kind:"security", words:["hack","scam","security","password","phishing","unsafe"], character:"cookie" },
  { kind:"cooking", words:["cook","recipe","dinner","food","meal","bake"], character:"lily" },
  { kind:"school", words:["homework","lesson","school","study","quiz","learn"], character:"lily" },
  { kind:"diy", words:["build","fix","diy","repair","craft"], character:"lily" },
  { kind:"code", words:["code","coding","program","script","typescript","javascript","python"], character:"kai" }
];

function explicitlyRequestedCharacter(text: string): CharacterId | undefined {
  const match = text.match(/\b(kai|lily|jake|cookie)(?:\.ai)?\b/i);
  if (!match) return undefined;
  return match[1].toLowerCase() as CharacterId;
}

export function classify(message: string): { kind: TaskKind; character: CharacterId; confidence: number } {
  const text = message.toLowerCase();
  const requestedCharacter = explicitlyRequestedCharacter(text);
  let best = { kind: "chat" as TaskKind, character: "kai" as CharacterId, score: 0 };
  for (const rule of rules) {
    const score = rule.words.reduce((n, word) => n + (text.includes(word) ? 1 : 0), 0);
    if (score > best.score) best = { kind: rule.kind, character: rule.character, score };
  }
  return {
    kind: best.kind,
    character: requestedCharacter ?? best.character,
    confidence: best.score === 0 ? (requestedCharacter ? 0.85 : 0.55) : Math.min(0.55 + best.score * 0.12, 0.97)
  };
}

export function planRequest(request: BrainRequest): BrainPlan {
  const { kind, character, confidence } = classify(request.message);
  const backgroundKinds = new Set<TaskKind>(["game","website","app","video"]);
  const steps = kind === "chat"
    ? ["Understand the user's request","Use conversation context","Generate a helpful response"]
    : ["Understand and validate the request","Create a project plan","Select required tools","Execute the work","Test the result","Return the real status"];
  return { character, kind, goal: request.message.trim(), steps, tools: toolsFor(kind), requiresBackgroundJob: backgroundKinds.has(kind), confidence };
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
