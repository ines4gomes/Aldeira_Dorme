import { GameState, NightRecord, NightStep, Player, Winner } from "./types";

// ---- Win condition (do NOT change) ----
// Lobos win when the number of OTHER living characters is LOWER than the
// number of living Lobos. Aldeia wins when there are no living Lobos.
export function checkWin(players: Player[]): Winner {
  const alive = players.filter((p) => p.alive);
  const wolves = alive.filter((p) => p.role === "Lobo").length;
  const others = alive.length - wolves;
  if (wolves === 0) return "aldeia";
  if (others < wolves) return "lobos";
  return null;
}

export function livingPlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.alive);
}

// Builds the ordered night script based on which roles are still alive.
export function buildNightSteps(players: Player[]): NightStep[] {
  const alive = players.filter((p) => p.alive);
  const steps: NightStep[] = [];
  if (alive.some((p) => p.role === "Lobo")) steps.push({ kind: "lobos" });
  alive
    .filter((p) => p.role === "Caçador")
    .forEach((h) => steps.push({ kind: "cacador", actorId: h.id }));
  if (alive.some((p) => p.role === "Profeta")) steps.push({ kind: "profeta" });
  if (alive.some((p) => p.role === "Dentista"))
    steps.push({ kind: "dentista" });
  if (alive.some((p) => p.role === "Protetor"))
    steps.push({ kind: "protetor" });
  return steps;
}

// Expands a set of death ids with any linked Gémeos partners.
function expandTwins(deaths: Set<string>, players: Player[]): void {
  let changed = true;
  while (changed) {
    changed = false;
    players.forEach((p) => {
      if (deaths.has(p.id) && p.twinId) {
        const partner = players.find((x) => x.id === p.twinId);
        if (partner && partner.alive && !deaths.has(partner.id)) {
          deaths.add(partner.id);
          changed = true;
        }
      }
    });
  }
}

const nameOf = (players: Player[], id: string | null): string =>
  players.find((p) => p.id === id)?.name || "?";

// Resolves the night's actions: computes deaths + a narratable summary.
// Returns a NEW players array and the mutated night record.
export function resolveNight(
  players: Player[],
  night: NightRecord,
): { players: Player[]; night: NightRecord } {
  const next = players.map((p) => ({ ...p }));
  const protectedId = night.protetorTarget;
  const deaths = new Set<string>();
  const summary: string[] = [];
  const roleOf = (id: string | null) =>
    next.find((p) => p.id === id)?.role ?? "Aldeão";

  summary.push(
    "E a manhã voltou... e muita coisa aconteceu esta noite. Vamos ver.",
  );

  // Wolves
  if (night.wolvesTarget) {
    const name = nameOf(next, night.wolvesTarget);
    if (protectedId && protectedId === night.wolvesTarget) {
      summary.push(
        `Os Lobos rondaram ${name} na escuridão... mas o Protetor velou por ele(a) esta noite. ${name} sobreviveu!`,
      );
    } else {
      deaths.add(night.wolvesTarget);
      summary.push(
        `Os Lobos circundaram ${name} e acabaram por matá-lo(a). E quem era ${name}? Afinal, ${name} era... ${roleOf(night.wolvesTarget)}.`,
      );
    }
  }

  // Hunters
  night.hunterChoices.forEach((hc) => {
    if (!hc.targetId) return;
    const name = nameOf(next, hc.targetId);
    if (hc.wasWolf) {
      if (protectedId && protectedId === hc.targetId) {
        summary.push(
          `O Caçador acertou em ${name}, um Lobo! Mas ${name} estava protegido e escapou.`,
        );
      } else {
        deaths.add(hc.targetId);
        summary.push(
          `O Caçador procurou e procurou, e a sua mira caiu sobre ${name}... e desta vez acertou! ${name} era mesmo um Lobo.`,
        );
      }
    } else {
      summary.push(
        `O Caçador procurou e procurou, e a sua mira caiu sobre ${name}... será que acertou no Lobo? Infelizmente não — ${name} era apenas ${roleOf(hc.targetId)}.`,
      );
    }
  });

  // Twin chaining
  const beforeTwins = new Set(deaths);
  expandTwins(deaths, next);
  deaths.forEach((id) => {
    if (!beforeTwins.has(id)) {
      summary.push(
        `E como eram Gémeos, ao perder um... ${nameOf(next, id)} não resistiu e partiu também. Morreram os dois.`,
      );
    }
  });

  // Apply deaths
  deaths.forEach((id) => {
    const p = next.find((x) => x.id === id);
    if (p && p.alive) {
      p.alive = false;
      p.deathNight = night.night;
      p.deathCause = "Noite";
    }
  });

  if (deaths.size === 0 && !night.wolvesTarget) {
    summary.push("A noite foi estranhamente calma. Ninguém morreu.");
  }

  // Profeta — revelado a todos na reunião da manhã
  if (night.profetaTarget) {
    summary.push(
      night.profetaIsWolf
        ? "O Profeta espreitou nas sombras esta noite... e acertou!"
        : "O Profeta espreitou nas sombras esta noite... mas desta vez falhou.",
    );
  }

  // Silenced note — um jogador protegido também não pode ser calado.
  if (night.dentistaTarget) {
    const p = next.find((x) => x.id === night.dentistaTarget);
    if (p) {
      if (protectedId && protectedId === night.dentistaTarget) {
        summary.push(
          `A Dentista tentou calar ${p.name}... mas não se exaltem: o Protetor protegeu-o. ${p.name} pode falar à vontade.`,
        );
      } else if (p.alive) {
        night.silencedId = p.id;
        summary.push(
          `A Dentista, cansada de ouvir ${p.name}, calou-o(a). Não vai poder falar nesta ronda.`,
        );
      }
    }
  }

  night.deaths = Array.from(deaths);
  night.summary = summary;
  return { players: next, night };
}

// Applies the village vote elimination (with twin chaining).
export function applyVote(
  players: Player[],
  targetId: string,
  night: number,
): Player[] {
  const next = players.map((p) => ({ ...p }));
  const deaths = new Set<string>([targetId]);
  expandTwins(deaths, next);
  deaths.forEach((id) => {
    const p = next.find((x) => x.id === id);
    if (p && p.alive) {
      p.alive = false;
      p.deathNight = night;
      p.deathCause = "Votação da aldeia";
    }
  });
  return next;
}
