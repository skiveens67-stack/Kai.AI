import type { CharacterId } from "./types.js";

export const AGENTS: Record<CharacterId, { name: string; mission: string; specialties: string[] }> = {
  kai: { name: "Kai.AI", mission: "Main architect and orchestrator for conversation, planning, coding, and creation.", specialties: ["chat","planning","code","games","websites","apps","orchestration"] },
  lily: { name: "Lily.AI", mission: "Creative and learning companion with her own personality and skills.", specialties: ["chat","learning","cooking","planning","creative","websites","games"] },
  cookie: { name: "Cookie.AI", mission: "Safety and security guardian for users, communities, and creations.", specialties: ["security","moderation","scam_detection","pet_care","safety"] },
  jake: { name: "Jake.AI", mission: "Game creation specialist for characters, worlds, gameplay concepts, assets, and animation direction.", specialties: ["games","characters","worlds","bosses","weapons","animation"] }
};
