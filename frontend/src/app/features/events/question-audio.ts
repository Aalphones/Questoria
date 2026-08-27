import { ContentService } from '../../services/content.service';

/**
 * Die Aufnahme zur Frage, wenn der Content eine mitbringt — sonst `undefined`,
 * und der Vorlese-Knopf fällt auf die Computerstimme zurück.
 *
 * `question_audio_path` trägt wie `audio_path` bei Dialogzeilen bereits den
 * vollen Unterpfad ab dem Welt-Ordner („audio/voices/…"), deshalb
 * `themeAssetUrl` statt `assetUrl` mit zusätzlichem Ordner — der ergäbe einen
 * doppelten, nicht existierenden Pfad.
 */
export function questionAudioUrlOf(
  content: ContentService,
  themeId: string,
  audioPath: string | undefined,
): string | undefined {
  if (audioPath === undefined) {
    return undefined;
  }

  return content.themeAssetUrl(themeId, audioPath);
}
