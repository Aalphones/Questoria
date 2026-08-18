import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { PlayerProfile } from '../../models/auth.types';
import { AuthService } from '../../services/auth.service';
import { ContentService } from '../../services/content.service';
import { GameStateService } from '../../services/game-state.service';
import { NarrationService, ReadingMode } from '../../services/narration.service';
import { ProfileService } from '../../services/profile.service';

/**
 * Kopfleiste auf jedem Spiel-Screen außer der Planetenkarte. Wird von jedem
 * Screen selbst eingebunden, nicht aus der Hülle heraus — jeder Screen kennt
 * seinen eigenen Rückweg (Design: `hub→login, level→hub, timeline→level,
 * map→timeline, dialog→map`). Modus-Umschalter und Ton-Knopf gehören der
 * Kopfleiste selbst — sie injiziert den `NarrationService` direkt. Ebenso der
 * Profil-Chip (Plan Phase 9): er zeigt das aktive Profil direkt aus
 * `ProfileService`/`GameStateService`, kein Screen reicht das durch.
 */
@Component({
  selector: 'qst-hud',
  imports: [RouterLink],
  templateUrl: './hud.html',
  styleUrl: './hud.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscapeKeydown()',
  },
})
export class Hud {
  private readonly narration = inject(NarrationService);
  private readonly profileService = inject(ProfileService);
  private readonly gameState = inject(GameStateService);
  private readonly authService = inject(AuthService);
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly backLink = input<readonly string[] | null>(null);
  readonly worldTitle = input<string | null>(null);
  readonly levelLabel = input<string | null>(null);
  readonly levelLink = input<readonly string[] | null>(null);
  readonly progress = input<{ done: number; total: number } | null>(null);

  protected readonly levelExplanation = 'Die Lernstufe bestimmt, wie schwer die Aufgaben sind';
  protected readonly progressExplanation = 'Geschaffte Orte in dieser Welt';

  protected readonly mode = this.narration.mode;
  protected readonly soundOn = this.narration.soundOn;

  protected readonly activeProfile = computed<PlayerProfile | null>(() => {
    const profileId = this.gameState.activeProfileId();

    if (profileId === null) {
      return null;
    }

    return this.profileService.profiles().find((profile) => profile.id === profileId) ?? null;
  });

  protected readonly avatarUrl = computed<string | null>(() => {
    const file = this.activeProfile()?.avatar ?? null;

    return file === null ? null : this.content.avatarUrl(file);
  });

  /** Wechselt der Avatar (anderes Profil, geändertes Bild), beginnt der Fehlerzustand neu. */
  protected readonly avatarFailed = linkedSignal<string | null, boolean>({
    source: () => this.avatarUrl(),
    computation: () => false,
  });

  protected readonly profileMenuOpen = signal(false);

  private readonly profileWrapper = viewChild<ElementRef<HTMLElement>>('profileWrapper');
  private readonly profileButton = viewChild<ElementRef<HTMLButtonElement>>('profileButton');

  protected setMode(mode: ReadingMode): void {
    this.narration.setMode(mode);
  }

  protected toggleSound(): void {
    this.narration.toggleSound();
  }

  protected markAvatarFailed(): void {
    this.avatarFailed.set(true);
  }

  protected toggleProfileMenu(): void {
    this.profileMenuOpen.update((open) => !open);
  }

  protected closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  protected onEscapeKeydown(): void {
    if (!this.profileMenuOpen()) {
      return;
    }

    this.closeProfileMenu();
    this.profileButton()?.nativeElement.focus();
  }

  protected logout(): void {
    this.closeProfileMenu();

    // Landet auf `/login` auch, wenn der Aufruf selbst scheitert (z. B. totes
    // Netz) — Abmelden darf niemanden im Spiel gefangen halten.
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/login'),
        error: () => void this.router.navigateByUrl('/login'),
      });
  }

  protected onDocumentClick(event: Event): void {
    if (!this.profileMenuOpen()) {
      return;
    }

    const wrapper = this.profileWrapper()?.nativeElement;

    if (wrapper !== undefined && !wrapper.contains(event.target as Node)) {
      this.closeProfileMenu();
    }
  }
}
