import {
  PokemonCatchConfig,
  PokemonCatchSpeed,
  PokemonCatchTarget,
} from '../../../models/content.types';

const SPEEDS = ['langsam', 'normal', 'schnell'] as const;

/**
 * Wo der Wurf gerade steht. `zieht` heißt: ein Finger hält den Ball und zieht
 * ihn mit. `fliegt` sperrt jeden weiteren Auslöser, `zurueck` ist der kurze
 * Rückweg nach einem Fehlwurf, `gefangen` läuft die Fangsequenz.
 */
export type ThrowState = 'bereit' | 'zieht' | 'fliegt' | 'zurueck' | 'gefangen';

/** Ein Messpunkt des Wischers — Ort und Zeitstempel des Zeigers. */
export interface FlickSample {
  readonly x: number;
  readonly y: number;
  readonly time: number;
}

/** Was aus einem losgelassenen Wischer wird: Richtung, Weite, Flugzeit. */
export interface Flick {
  readonly x: number;
  readonly y: number;
  readonly distance: number;
  readonly durationMs: number;
}

/**
 * Die drei Plätze, zwischen denen das Ziel springt — links, Mitte, rechts.
 * Es läuft nicht durch, es steht und wechselt (wie in Let's Go).
 */
export const TARGET_SLOTS = ['links', 'mitte', 'rechts'] as const;
export type TargetSlot = (typeof TARGET_SLOTS)[number];

/** Ab diesem Wurf wird es leichter: Ziel wechselt halb so oft, Trefferfläche doppelt. */
export const EASY_FROM_THROW = 4;

/** Ab diesem Wurf trifft jeder Ball, egal wohin gewischt wurde. */
export const GUARANTEED_FROM_THROW = 5;

/**
 * Trefferfläche als Anteil der Ziel-Kastengröße, von der Mitte aus gemessen:
 * 0.5 ist genau der Kasten, alles darüber ein Rand drumherum.
 */
export const HIT_TOLERANCE_SHARE = 0.5;

/**
 * Langsamer als das gilt nicht als Wurf. Ein Antippen oder ein zaghaftes
 * Schubsen soll keinen Ball kosten — sonst verbraucht ein Kind seine Würfe,
 * ohne je geworfen zu haben.
 */
export const MIN_FLICK_SPEED = 320;

/**
 * Aus Wischgeschwindigkeit wird Flugweite: so viele Sekunden trägt der Schwung
 * den Ball weiter. Ein zügiger Wischer (~2000 px/s) kommt damit gut 600 px
 * weit — quer über die Bühne.
 */
export const FLICK_REACH_SECONDS = 0.32;

/**
 * Nur die letzten Millisekunden des Wischers zählen. Wer erst zielt und dann
 * schnippt, soll am Schnipp gemessen werden und nicht am Zielen davor.
 */
export const FLICK_SAMPLE_WINDOW_MS = 90;

/** Flugweite bleibt zwischen diesen Anteilen der Bühnenhöhe. */
export const MIN_REACH_SHARE = 0.25;
export const MAX_REACH_SHARE = 1.6;

/** Scheitel des Bogens als Anteil der Flugweite. */
export const ARC_SHARE = 0.22;

/** Flugzeit aus der Weite: so viele Pixel je Sekunde, gedeckelt nach beiden Seiten. */
export const FLIGHT_PIXELS_PER_SECOND = 1500;
export const MIN_FLIGHT_MS = 320;
export const MAX_FLIGHT_MS = 850;

/** So lange braucht der Ball zurück an seinen Platz, bevor er wieder greifbar ist. */
export const RETURN_MS = 320;

/**
 * Wie lange das Ziel auf einem Platz stehen bleibt, bevor es zum nächsten
 * springt — je `speed` aus dem Content. Dazu kommt ein Zufallsanteil, damit
 * der Wechsel nicht abzählbar wird und das Kind wirklich hinsehen muss.
 */
export const DWELL_MS: Record<PokemonCatchSpeed, number> = {
  langsam: 3400,
  normal: 2400,
  schnell: 1600,
};

/** Zufallsanteil auf die Standzeit, als Anteil der Standzeit selbst. */
export const DWELL_JITTER_SHARE = 0.35;

/** So lange steht die Ansage über der Bühne, danach blendet sie aus. */
export const INTRO_VISIBLE_MS = 7000;

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
