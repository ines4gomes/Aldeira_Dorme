import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";
import { buildRoleList } from "./roles";
import { applyVote, checkWin, resolveNight } from "./engine";
import { GameState, NightRecord, Player, Role } from "./types";

const STORAGE_KEY = "aldeia_dorme_game_v1";

const emptyState: GameState = {
  status: "setup",
  playerCount: 0,
  pendingRoles: [],
  players: [],
  dealtCount: 0,
  currentNight: 0,
  nightStepIndex: 0,
  nights: [],
  winner: null,
  createdAt: "",
};

const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function linkTwins(players: Player[]): Player[] {
  const twins = players.filter((p) => p.role === "Gémeos");
  if (twins.length === 2) {
    return players.map((p) => {
      if (p.id === twins[0].id) return { ...p, twinId: twins[1].id };
      if (p.id === twins[1].id) return { ...p, twinId: twins[0].id };
      return p;
    });
  }
  return players;
}

function newNight(night: number): NightRecord {
  return {
    night,
    wolvesTarget: null,
    hunterChoices: [],
    profetaTarget: null,
    profetaIsWolf: null,
    dentistaTarget: null,
    protetorTarget: null,
    deaths: [],
    summary: [],
    silencedId: null,
    villageVote: null,
  };
}

interface GameContextValue {
  state: GameState;
  ready: boolean;
  startGame: (count: number) => void;
  assignNext: (name: string) => { name: string; role: Role };
  startNight: () => void;
  confirmStep: (
    updater: (curr: NightRecord) => NightRecord,
    totalSteps: number,
  ) => void;
  confirmVote: (targetId: string) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(emptyState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Load persisted game on cold start.
  useEffect(() => {
    (async () => {
      const raw = await storage.getItem(STORAGE_KEY, "");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as GameState;
          if (parsed && parsed.status) setState(parsed);
        } catch {
          // ignore corrupt save
        }
      }
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  // Persist on every change (after initial load).
  useEffect(() => {
    if (!loaded.current) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const startGame = (count: number) => {
    setState({
      ...emptyState,
      status: "dealing",
      playerCount: count,
      pendingRoles: buildRoleList(count),
      players: [],
      dealtCount: 0,
      createdAt: new Date().toISOString(),
    });
  };

  const assignNext = (name: string) => {
    const role = state.pendingRoles[state.dealtCount];
    const player: Player = {
      id: uid(),
      name: name.trim(),
      role,
      alive: true,
      deathNight: null,
      deathCause: null,
      twinId: null,
    };
    setState((prev) => {
      const players = [...prev.players, player];
      const dealtCount = prev.dealtCount + 1;
      if (dealtCount >= prev.playerCount) {
        return {
          ...prev,
          players: linkTwins(players),
          dealtCount,
          status: "dashboard",
        };
      }
      return { ...prev, players, dealtCount };
    });
    return { name: player.name, role };
  };

  const startNight = () => {
    setState((prev) => {
      const currentNight = prev.currentNight + 1;
      return {
        ...prev,
        status: "night",
        currentNight,
        nightStepIndex: 0,
        nights: [...prev.nights, newNight(currentNight)],
      };
    });
  };

  const confirmStep = (
    updater: (curr: NightRecord) => NightRecord,
    totalSteps: number,
  ) => {
    setState((prev) => {
      const nights = [...prev.nights];
      const idx = prev.currentNight - 1;
      nights[idx] = updater({ ...nights[idx] });
      const nextStepIndex = prev.nightStepIndex + 1;

      if (nextStepIndex >= totalSteps) {
        const resolved = resolveNight(prev.players, nights[idx]);
        nights[idx] = resolved.night;
        const winner = checkWin(resolved.players);
        return {
          ...prev,
          players: resolved.players,
          nights,
          nightStepIndex: nextStepIndex,
          status: winner ? "finished" : "day",
          winner,
        };
      }
      return { ...prev, nights, nightStepIndex: nextStepIndex };
    });
  };

  const confirmVote = (targetId: string) => {
    setState((prev) => {
      const players = applyVote(prev.players, targetId, prev.currentNight);
      const nights = [...prev.nights];
      const idx = prev.currentNight - 1;
      if (nights[idx]) nights[idx] = { ...nights[idx], villageVote: targetId };
      const winner = checkWin(players);
      return {
        ...prev,
        players,
        nights,
        winner,
        status: winner ? "finished" : "dashboard",
      };
    });
  };

  const resetGame = () => {
    setState(emptyState);
    storage.removeItem(STORAGE_KEY);
  };

  return (
    <GameContext.Provider
      value={{
        state,
        ready,
        startGame,
        assignNext,
        startNight,
        confirmStep,
        confirmVote,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
