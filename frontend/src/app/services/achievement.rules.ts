import { Achievement, AchievementCondition, MapEntry, WorldConfig } from '../models/content.types';
import { ThemeProgress } from '../models/game-state.types';

/**
 * Reine Rechnerei ohne Zugriff auf Speicher oder Signale — Vorbild
 * `progress.rules.ts`. Das Backend kennt keinen dieser Bedingungstypen
 * (Plan Phase 7, AK 6) — die Auswertung passiert ausschließlich hier.
 */

function totalStars(progress: ThemeProgress): number {
  return Object.values(progress).reduce((sum: number, entry) => sum + entry.stars, 0);
}

function isStageCompleted(world: WorldConfig, stageId: string, progress: ThemeProgress): boolean {
  const stage = world.arc_overview.stages.find((entry) => entry.map_id === stageId);
  const map = stage === undefined ? undefined : world.maps.find((entry: MapEntry) => entry.id === stage.map_id);

  // Ein Bedingungstipp, der auf keine Etappe/Map trifft (Content-Tippfehler),
  // gilt als nicht erfüllt statt die Auswertung abstürzen zu lassen.
  if (map === undefined) {
    return false;
  }

  return map.nodes.every((node) => progress[node.episode_ref] !== undefined);
}

function isConditionMet(condition: AchievementCondition, world: WorldConfig, progress: ThemeProgress): boolean {
  switch (condition.type) {
    case 'episodes_completed':
      return Object.keys(progress).length >= condition.count;
    case 'stars_total':
      return totalStars(progress) >= condition.count;
    case 'episode_perfect':
      return (progress[condition.episode_id]?.stars ?? 0) >= 3;
    case 'stage_completed':
      return isStageCompleted(world, condition.stage_id, progress);
  }
}

/** Schlüssel aller Erfolge, deren Bedingung der aktuelle Fortschritt erfüllt. */
export function evaluate(
  achievements: readonly Achievement[],
  world: WorldConfig,
  progress: ThemeProgress,
): string[] {
  return achievements
    .filter((achievement: Achievement) => isConditionMet(achievement.condition, world, progress))
    .map((achievement: Achievement) => achievement.key);
}

function episodeName(world: WorldConfig, episodeId: string): string | null {
  for (const map of world.maps) {
    const node = map.nodes.find((entry) => entry.episode_ref === episodeId);

    if (node !== undefined) {
      return node.name;
    }
  }

  return null;
}

function stageName(world: WorldConfig, stageId: string): string | null {
  return world.arc_overview.stages.find((stage) => stage.map_id === stageId)?.name ?? null;
}

/**
 * Ein kindgerechter Hinweis, was zu einem noch offenen Erfolg fehlt (Plan
 * Phase 7, AK 5) — kein Rätselraten, sondern eine klare Ansage.
 */
export function conditionHint(condition: AchievementCondition, world: WorldConfig): string {
  switch (condition.type) {
    case 'episodes_completed':
      return condition.count === 1
        ? 'Schaffe einen Ort.'
        : `Schaffe ${condition.count} Orte.`;
    case 'stars_total':
      return `Sammle ${condition.count} Sterne.`;
    case 'episode_perfect': {
      const name = episodeName(world, condition.episode_id);

      return name === null
        ? 'Schaffe diesen Ort mit drei Sternen.'
        : `Schaffe „${name}“ mit drei Sternen.`;
    }
    case 'stage_completed': {
      const name = stageName(world, condition.stage_id);

      return name === null
        ? 'Schaffe diese Etappe vollständig.'
        : `Schaffe die Etappe „${name}“ vollständig.`;
    }
  }
}
