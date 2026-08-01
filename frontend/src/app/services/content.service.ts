import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { MainHub, WorldConfig } from '../models/content.types';

/**
 * Liest den Content in Meilenstein 1 als statische Dateien aus dem eigenen
 * Build — noch kein Backend-Aufruf (siehe ADR-001). Sobald die Content-API
 * steht, ändern sich nur die URLs hier, nicht die Signaturen.
 */
@Service()
export class ContentService {
  private readonly http = inject(HttpClient);

  getMainHub(): Observable<MainHub> {
    return this.http.get<MainHub>('/assets/main_hub.json');
  }

  /** `configPath` kommt aus `InstalledTheme.config_path` und ist build-relativ. */
  getWorldConfig(configPath: string): Observable<WorldConfig> {
    return this.http.get<WorldConfig>(`/${configPath}`);
  }
}
