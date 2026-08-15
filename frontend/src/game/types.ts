export type Role =
  | "Lobo"
  | "Caçador"
  | "Profeta"
  | "Dentista"
  | "Protetor"
  | "Gémeos"
  | "Aldeão";

export interface Player {
  id: string;
  name: string;
  role: Role;
  alive: boolean;
  deathNight: number | null;
  deathCause: string | null;
  twinId: string | null;
}

export interface HunterChoice {
  hunterId: string;
  targetId: string | null;
  wasWolf: boolean;
}

export interface NightRecord {
  night: number;
  wolvesTarget: string | null;
  hunterChoices: HunterChoice[];
  profetaTarget: string | null;
  profetaIsWolf: boolean | null;
  dentistaTarget: string | null;
  protetorTarget: string | null;
  deaths: string[];
  summary: string[];
  silencedId: string | null;
  villageVote: string | null;
}

export type GameStatus =
  | "setup"
  | "dealing"
  | "dashboard"
  | "night"
  | "day"
  | "finished";

export type Winner = "lobos" | "aldeia" | null;

// A single step of the interactive night script.
export interface NightStep {
  kind: "lobos" | "cacador" | "profeta" | "dentista" | "protetor";
  actorId?: string; // for per-actor steps (hunters)
}

export interface GameState {
  status: GameStatus;
  playerCount: number;
  pendingRoles: Role[];
  players: Player[];
  dealtCount: number;
  currentNight: number;
  nightStepIndex: number;
  nights: NightRecord[];
  winner: Winner;
  createdAt: string;
}
