import { GameState, NightRecord, NightStep, Player, Winner } from "./types";

// ---- Win condition (do NOT change) ----
// Lobos win when the number of OTHER living characters is LOWER OR EQUAL than the
// number of living Lobos. Aldeia wins when there are no living Lobos.
export function checkWin(players: Player[]): Winner {
  const alive = players.filter((p) => p.alive);
  const wolves = alive.filter((p) => p.role === "Lobo").length;
  const others = alive.length - wolves;
  if (wolves === 0) return "aldeia";
  if (others <= wolves) return "lobos"; // <-- Corrigido para incluir o empate
  return null;
}

export function livingPlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.alive);
}

// Builds the ordered night script based on which roles are still alive.
// Adicionada a currentNight para saber quando é a primeira noite (para os Gémeos)
export function buildNightSteps(players: Player[], currentNight: number = 1): any[] {
  const alive = players.filter((p) => p.alive);
  const steps: any[] = [];
  
  // Gémeos acordam apenas na primeira noite para se conhecerem
  if (currentNight === 1 && alive.some((p) => p.role === "Gémeos" || p.twinId)) {
    steps.push({ kind: "gemeos" });
  }

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

  // Função robusta para verificar se um jogador está protegido, incluindo o seu gémeo
  const isProt = (id: string | null | undefined) => {
    if (!id || !protectedId) return false;
    if (id === protectedId) return true;
    const target = next.find((p) => p.id === id);
    if (target && target.twinId === protectedId) return true;
    const prot = next.find((p) => p.id === protectedId);
    if (prot && prot.twinId === id) return true;
    return false;
  };

  // Grava uma "marca" nos jogadores protegidos para sobreviverem à votação da aldeia no dia seguinte
  next.forEach(p => {
    (p as any).isProtectedFromVote = isProt(p.id);
  });

  summary.push(
    "E a manhã voltou... e muita coisa aconteceu esta noite. Vamos ver.",
  );

  // Wolves
  if (night.wolvesTarget) {
    const name = nameOf(next, night.wolvesTarget);
    if (isProt(night.wolvesTarget)) {
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
    
    if (isProt(hc.targetId)) {
      summary.push(
        `O Caçador atirou em ${name}... mas o Protetor velou por ele(a) e a bala foi desviada! ${name} sobreviveu.`,
      );
    } else {
      deaths.add(hc.targetId); // A morte acontece sempre agora!
      if (hc.wasWolf) {
        summary.push(
          `O Caçador procurou e procurou, e a sua mira caiu sobre ${name}... e desta vez acertou! ${name} era mesmo um Lobo.`,
        );
      } else {
        summary.push(
          `O Caçador procurou e procurou, e atirou sobre ${name}... mas cometeu um erro terrível. Matou um inocente, que era apenas ${roleOf(hc.targetId)}.`,
        );
      }
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

  // Silenced note
  if (night.dentistaTarget) {
    const p = next.find((x) => x.id === night.dentistaTarget);
    if (p) {
      if (isProt(night.dentistaTarget)) {
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
  
  // Verifica se o alvo foi protegido na noite anterior
  const target = next.find(x => x.id === targetId);
  if (target && (target as any).isProtectedFromVote) {
    // Se está protegido, ninguém morre na votação. Remove a proteção para não ficar invencível.
    next.forEach(p => { (p as any).isProtectedFromVote = false; });
    return next;
  }

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
  
  // Remove a proteção no fim do dia
  next.forEach(p => { (p as any).isProtectedFromVote = false; });
  return next;
}
