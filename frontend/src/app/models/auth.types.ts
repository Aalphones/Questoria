/**
 * Anmeldung und Profile, verbindlich beschrieben im Plan-Kontrakt
 * (`docs/planning/2026-08-17_nutzerverwaltung-und-spielstand/README.md`).
 */

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export interface PlayerProfile {
  id: number;
  display_name: string;
  avatar: string | null;
  selected_theme: string | null;
  selected_level: string | null;
}
