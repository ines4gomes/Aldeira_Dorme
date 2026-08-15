import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

type SoundKey = "wolf" | "gun" | "crowd";

const sources: Record<SoundKey, number> = {
  wolf: require("../../assets/sounds/wolf.mp3"),
  gun: require("../../assets/sounds/gun.mp3"),
  crowd: require("../../assets/sounds/crowd.mp3"),
};

const players: Partial<Record<SoundKey, ReturnType<typeof createAudioPlayer>>> =
  {};
let inited = false;

async function ensureInit() {
  if (inited) return;
  inited = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {
    // ignore — audio mode is best-effort
  }
}

// Fire-and-forget SFX. Never throws; silently no-ops on failure.
export async function playSound(key: SoundKey) {
  try {
    await ensureInit();
    if (!players[key]) players[key] = createAudioPlayer(sources[key]);
    const p = players[key]!;
    try {
      await p.seekTo(0);
    } catch {
      // some platforms need the player loaded first
    }
    p.play();
  } catch {
    // audio unavailable (e.g. web autoplay policy) — ignore
  }
}
