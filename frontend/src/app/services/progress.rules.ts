import { ProgressState } from '../models/game-state.types';
import { MapEntry, WorldConfig } from '../models/content.types';

/**
 * Reine Rechnerei ohne Zugriff auf Speicher oder Signale — bleibt
 * unverändert, wenn Meilenstein 4 `ProgressService` gegen die Savegame-
 * Schnittstelle tauscht (ADR-006).
 */

function nodeCompletedStates(
  map: MapEntry,
  isCompleted: (episodeId: string) => boolean,
): boolean[] {
  return map.nodes.map((node) => isCompleted(node.episode_ref));
}

/** Zustand jeder Etappe, Schlüssel = `map_id`. */
export function stageStates(
  world: WorldConfig,
  isCompleted: (episodeId: string) => boolean,
): Map<string, ProgressState> {
  const states = new Map<string, ProgressState>();
  let previousStagesDone = true;

  for (const stage of world.arc_overview.stages) {
    const map = world.maps.find((entry: MapEntry) => entry.id === stage.map_id);

    // Verweist eine Etappe auf eine Karte, die es nicht gibt, gilt sie als
    // gesperrt — kein Absturz wegen eines Content-Tippfehlers.
    if (map === undefined) {
      states.set(stage.map_id, 'locked');
      previousStagesDone = false;
      continue;
    }

    const nodeStatesOfStage = nodeCompletedStates(map, isCompleted);
    // Eine Etappe ohne Orte gilt als geschafft — sie hat nichts, was man tun könnte.
    const stageDone = nodeStatesOfStage.length === 0 || nodeStatesOfStage.every(Boolean);

    if (!previousStagesDone) {
      states.set(stage.map_id, 'locked');
    } else if (stageDone) {
      states.set(stage.map_id, 'done');
    } else {
      states.set(stage.map_id, 'current');
      previousStagesDone = false;
    }
  }

  return states;
}

/** Zustand jedes Orts einer Karte, Schlüssel = `node.id`. */
export function nodeStates(
  map: MapEntry,
  isCompleted: (episodeId: string) => boolean,
  stage: ProgressState,
): Map<string, ProgressState> {
  const states = new Map<string, ProgressState>();

  if (stage === 'locked') {
    for (const node of map.nodes) {
      states.set(node.id, 'locked');
    }
    return states;
  }

  let currentAssigned = false;

  for (const node of map.nodes) {
    if (isCompleted(node.episode_ref)) {
      states.set(node.id, 'done');
      continue;
    }

    // Erster nicht geschaffter Ort — nur wenn die Etappe nicht gesperrt ist.
    if (!currentAssigned) {
      states.set(node.id, 'current');
      currentAssigned = true;
    } else {
      states.set(node.id, 'locked');
    }
  }

  return states;
}

/** Abgerundeter Durchschnitt der Sterne der geschafften Orte einer Karte. */
export function stageStars(
  map: MapEntry,
  starsFor: (episodeId: string) => number | null,
): number {
  const completedStars = map.nodes
    .map((node) => starsFor(node.episode_ref))
    .filter((stars): stars is number => stars !== null);

  if (completedStars.length === 0) {
    return 0;
  }

  const total = completedStars.reduce((sum: number, stars: number) => sum + stars, 0);
  return Math.floor(total / completedStars.length);
}

/** Geschaffte Orte / Orte gesamt der Welt — eine Regel für alle Screens. */
export function worldProgress(
  world: WorldConfig,
  isCompleted: (episodeId: string) => boolean,
): { done: number; total: number } {
  const allNodes = world.maps.flatMap((map: MapEntry) => map.nodes);
  const done = allNodes.filter((node) => isCompleted(node.episode_ref)).length;

  return { done, total: allNodes.length };
}
