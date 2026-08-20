import { ImageSearchConfig, SearchTarget } from '../../../models/content.types';

/**
 * Taugt die aufgelöste Konfiguration überhaupt als Bildsuche? Ohne diese
 * Prüfung zeigte eine kaputte Content-Datei eine leere Aufgabe statt der
 * Fehlermeldung des Gerüsts.
 */
export function isImageSearchConfig(config: unknown): config is ImageSearchConfig {
  const candidate = config as Partial<ImageSearchConfig> | null;
  const targets = candidate?.targets;

  if (typeof candidate?.image !== 'string' || typeof candidate?.question !== 'string') {
    return false;
  }

  if (!Array.isArray(targets) || targets.length === 0 || !targets.every(isSearchTarget)) {
    return false;
  }

  if (typeof candidate.find_all !== 'boolean') {
    return false;
  }

  const findCount = candidate.find_count;

  if (findCount === undefined) {
    return true;
  }

  return Number.isInteger(findCount) && findCount >= 1 && findCount <= targets.length;
}

function isSearchTarget(target: unknown): target is SearchTarget {
  const candidate = target as Partial<SearchTarget> | null;

  return (
    typeof candidate?.label === 'string' &&
    typeof candidate?.x === 'number' &&
    typeof candidate?.y === 'number' &&
    typeof candidate?.radius === 'number'
  );
}

/**
 * Trefferprüfung als reine Funktion. Abstand in Prozent der Bildbreite
 * gerechnet — dasselbe Bezugsmaß wie `radius`, sonst trifft nichts auf hohen
 * Bildern. `heightToWidthRatio` (Bildhöhe / Bildbreite) rechnet die
 * y-Abweichung, die in Prozent der Bildhöhe steckt, in dieselbe Einheit um.
 */
export function hitTarget(
  targets: readonly SearchTarget[],
  xPercent: number,
  yPercent: number,
  heightToWidthRatio: number,
): SearchTarget | null {
  return (
    targets.find((target: SearchTarget) => {
      const deltaX = xPercent - target.x;
      const deltaY = (yPercent - target.y) * heightToWidthRatio;

      return Math.hypot(deltaX, deltaY) <= target.radius;
    }) ?? null
  );
}
