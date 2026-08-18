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
 * Checkliste „Bildauswahl") — kein Datei-Upload. Reine Dateinamen, keine
 * Pfade: Die Dateien selbst liegen unter `data/avatars/` (Google-Drive-Junction,
 * siehe `AGENTS.md` → Content-Repository) und werden über
 * `ContentService.avatarUrl()` zur Adresse. Fehlt eine Datei, zeigt
 * `qst-image-slot` den Farbkreis-Ersatz aus dem Mockup.
 */
export const AVAILABLE_AVATARS: readonly string[] = [
  'ladybug.png',
  'bloom.png',
  'einhorn.png',
  'gabby.png'
];
