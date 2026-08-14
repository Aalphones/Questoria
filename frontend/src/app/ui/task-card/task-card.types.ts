/** Ein Fortschrittspunkt im Kopf der Aufgaben-Karte. */
export type TaskStepState = 'done' | 'current' | 'open';

export interface TaskStep {
  readonly position: number;
  readonly state: TaskStepState;
}
