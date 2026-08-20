import { PokemonCatchConfig, PokemonCatchTarget } from '../../../models/content.types';

const SPEEDS = ['langsam', 'normal', 'schnell'] as const;

/**
 * Taugt die aufgelöste Konfiguration überhaupt als Fangspiel? Ohne mindestens
 * ein Ziel stünde eine leere Bühne da (Phase-1-AK 3) — das gehört in den
 * Fehlerpfad des Gerüsts, nicht auf den Bildschirm.
 */
export function isPokemonCatchConfig(config: unknown): config is PokemonCatchConfig {
  const candidate = config as Partial<PokemonCatchConfig> | null;
  const targets = candidate?.targets;

  if (!Array.isArray(targets) || targets.length === 0 || !targets.every(isPokemonCatchTarget)) {
    return false;
  }

  if (typeof candidate?.ball !== 'string' || candidate.ball.length === 0) {
    return false;
  }

  if (candidate.ball_blink !== undefined && typeof candidate.ball_blink !== 'string') {
    return false;
  }

  if (typeof candidate.intro !== 'string' || candidate.intro.length === 0) {
    return false;
  }

  return (SPEEDS as readonly string[]).includes(candidate.speed as string);
}

function isPokemonCatchTarget(target: unknown): target is PokemonCatchTarget {
  const candidate = target as Partial<PokemonCatchTarget> | null;

  return typeof candidate?.sprite === 'string' && typeof candidate?.name === 'string';
}
