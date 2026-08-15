import { Role } from "./types";
import { colors } from "../theme";

interface RoleMeta {
  role: Role;
  icon: string; // MaterialCommunityIcons name
  color: string;
  tagline: string;
  team: "lobos" | "aldeia";
}

export const ROLE_META: Record<Role, RoleMeta> = {
  Lobo: {
    role: "Lobo",
    icon: "paw",
    color: colors.crimson,
    tagline: "Caças na escuridão. Elimina a aldeia sem seres descoberto.",
    team: "lobos",
  },
  Caçador: {
    role: "Caçador",
    icon: "bow-arrow",
    color: colors.gold,
    tagline: "Aponta para quem acreditas ser Lobo. Se acertares, ele morre.",
    team: "aldeia",
  },
  Profeta: {
    role: "Profeta",
    icon: "eye",
    color: colors.gold,
    tagline: "Todas as noites descobres se alguém é Lobo.",
    team: "aldeia",
  },
  Dentista: {
    role: "Dentista",
    icon: "tooth",
    color: colors.gold,
    tagline: "Escolhes quem fica calado na ronda seguinte.",
    team: "aldeia",
  },
  Protetor: {
    role: "Protetor",
    icon: "shield-half-full",
    color: colors.gold,
    tagline: "Proteges alguém do ataque dos Lobos (podes ser tu próprio).",
    team: "aldeia",
  },
  Gémeos: {
    role: "Gémeos",
    icon: "account-multiple",
    color: colors.gold,
    tagline: "Vocês estão ligados. Se um morrer, o outro também morre.",
    team: "aldeia",
  },
  Aldeão: {
    role: "Aldeão",
    icon: "account",
    color: colors.onSurfaceSecondary,
    tagline: "Sobrevive e ajuda a descobrir quem são os Lobos.",
    team: "aldeia",
  },
};

// Returns the special-role composition for a given player count.
// Boundaries: the upper bound belongs to the band containing it
// (5 -> band1, 10 -> band2, 15 -> band3, 20 -> band4, 30 -> band5).
export function getComposition(n: number): Partial<Record<Role, number>> {
  if (n <= 5) return { Lobo: 1, Caçador: 1 };
  if (n <= 10)
    return { Lobo: 1, Caçador: 1, Profeta: 1, Dentista: 1, Protetor: 1 };
  if (n <= 15)
    return {
      Lobo: 2,
      Caçador: 1,
      Profeta: 1,
      Dentista: 1,
      Protetor: 1,
      Gémeos: 2,
    };
  if (n <= 20)
    return {
      Lobo: 2,
      Caçador: 2,
      Profeta: 1,
      Dentista: 1,
      Protetor: 1,
      Gémeos: 2,
    };
  return {
    Lobo: 4,
    Caçador: 2,
    Profeta: 1,
    Dentista: 1,
    Protetor: 1,
    Gémeos: 2,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds the full, shuffled list of roles for n players.
export function buildRoleList(n: number): Role[] {
  const comp = getComposition(n);
  const roles: Role[] = [];
  (Object.keys(comp) as Role[]).forEach((role) => {
    for (let i = 0; i < (comp[role] || 0); i++) roles.push(role);
  });
  while (roles.length < n) roles.push("Aldeão");
  return shuffle(roles);
}

// Human-readable preview of the composition (for the setup screen).
export function compositionSummary(n: number): { role: Role; count: number }[] {
  const comp = getComposition(n);
  const specials = (Object.keys(comp) as Role[]).map((role) => ({
    role,
    count: comp[role] || 0,
  }));
  const specialTotal = specials.reduce((s, r) => s + r.count, 0);
  const villagers = Math.max(0, n - specialTotal);
  return [...specials, { role: "Aldeão" as Role, count: villagers }].filter(
    (r) => r.count > 0,
  );
}
