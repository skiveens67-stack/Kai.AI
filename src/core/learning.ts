const EXPLICIT_MEMORY_CUES = [
  "remember that ", "please remember ", "for future chats ", "for future conversations ",
  "i prefer ", "my preference is ", "i want kai to ", "kai should always ", "kai should never ",
  "dont use ", "don't use ", "never use ", "always use "
];

const SENSITIVE_CUES = [
  "password is", "my password", "api key", "secret key", "credit card", "social security", "ssn is",
  "verification code", "recovery code", "private key"
];

/** Saves only explicit, non-secret preferences/instructions—not guesses or model-invented facts. */
export function extractDurableFact(message: string): string | null {
  const normalized = message.trim().replace(/\\s+/g, " ");
  const lower = normalized.toLowerCase();
  if (!normalized || normalized.length > 1000) return null;
  if (SENSITIVE_CUES.some(cue => lower.includes(cue))) return null;
  if (!EXPLICIT_MEMORY_CUES.some(cue => lower.includes(cue))) return null;
  const sentence = normalized.split(/(?<=[.!?])\\s+/)[0].trim();
  if (sentence.length < 8 || sentence.length > 300) return null;
  return sentence;
}

export function mergeDurableFacts(existing: string | null, next: string): string[] {
  let facts: string[] = [];
  try { const parsed: unknown = existing ? JSON.parse(existing) : []; if (Array.isArray(parsed)) facts = parsed.filter((x): x is string => typeof x === "string"); }
  catch { facts = []; }
  if (!facts.some(fact => fact.toLowerCase() === next.toLowerCase())) facts.push(next);
  return facts.slice(-20);
}
