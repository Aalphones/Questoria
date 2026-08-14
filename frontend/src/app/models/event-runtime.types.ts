/**
 * Die Außenfläche zwischen Ablauf-Gerüst und Event-Komponente — verbindlich
 * beschrieben im Plan zu Meilenstein 3 (Abschnitt „Kontrakt"). Eine
 * Event-Komponente bekommt Konfiguration und Kontext, spielt sie und meldet
 * genau ein Ergebnis zurück. Mehr weiß sie über die Umgebung nicht.
 */

/** Was ein Event zurückmeldet, wenn es fertig ist. */
export type EventOutcome =
  | { readonly kind: 'story' }
  | { readonly kind: 'scored'; readonly correctFirstTry: boolean };

/** Was jede Event-Komponente über die Umgebung wissen darf — mehr nicht. */
export interface EventContext {
  readonly themeId: string;
  readonly difficultyLevelId: string;
}
