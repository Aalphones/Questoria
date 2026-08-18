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

/**
 * Feste Auswahl mitgelieferter Bilder für die Profilanlage (Plan Phase 4,
 * Checkliste „Bildauswahl") — kein Datei-Upload. Die Dateien selbst sind
 * Platzhalter unter `frontend/public/avatars/`; fehlt eine, zeigt
 * `qst-image-slot` den Farbkreis-Ersatz aus dem Mockup.
 */
export const AVAILABLE_AVATARS: readonly string[] = [
  'avatars/avatar-1.svg',
  'avatars/avatar-2.svg',
  'avatars/avatar-3.svg',
  'avatars/avatar-4.svg',
  'avatars/avatar-5.svg',
  'avatars/avatar-6.svg',
];
