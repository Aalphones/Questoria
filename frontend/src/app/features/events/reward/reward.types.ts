import { RewardConfig } from '../../../models/content.types';

/**
 * Prüft nur, dass überhaupt ein Objekt hereinkommt — `card_id` selbst ist
 * optional (Plan Phase 5, AK 3: fehlt sie, gibt es eben nur Sterne). Steht sie
 * da, muss sie eine Zeichenkette sein, sonst rutscht ein kaputter Verweis
 * ungeprüft bis nach Meilenstein 5 durch.
 */
export function isRewardConfig(config: unknown): config is RewardConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const cardId = (config as Partial<RewardConfig>).card_id;

  return cardId === undefined || typeof cardId === 'string';
}
