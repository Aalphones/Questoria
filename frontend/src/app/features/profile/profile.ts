import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AVAILABLE_AVATARS, PlayerProfile } from '../../models/auth.types';
import { ContentService } from '../../services/content.service';
import { ProfileService } from '../../services/profile.service';
import { ImageSlot } from '../../ui/image-slot/image-slot';
import { ReadAloudButton } from '../../ui/read-aloud-button/read-aloud-button';

const SPOKEN_QUESTION = 'Wer segelt heute mit? Tippe auf dein Bild.';

const GENERIC_LOAD_ERROR = 'Die Profile konnten nicht geladen werden.';
const GENERIC_CREATE_ERROR = 'Das Profil konnte nicht angelegt werden.';
const GENERIC_DELETE_ERROR = 'Das Profil konnte nicht gelöscht werden.';

/**
 * Profilauswahl nach dem Prototyp-Screen `login` (Plan Phase 4). Trägt
 * bewusst nicht den Namen `Login` — dieser Screen ist die Profilwahl, die
 * echte Anmeldung ist `features/auth/login.ts` (Phase 3, kein Mockup dafür).
 */
@Component({
  selector: 'qst-profile-picker',
  imports: [ReactiveFormsModule, ImageSlot, ReadAloudButton],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePicker {
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly content = inject(ContentService);

  protected readonly spokenQuestion = SPOKEN_QUESTION;
  protected readonly avatars = AVAILABLE_AVATARS;

  protected readonly profiles = this.profileService.profiles;
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly creating = signal(false);
  protected readonly submittingCreate = signal(false);
  protected readonly profileToDelete = signal<PlayerProfile | null>(null);
  protected readonly deleting = signal(false);

  private readonly deleteDialog = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  readonly createForm = this.formBuilder.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(50)]],
    avatar: [AVAILABLE_AVATARS[0]],
  });

  constructor() {
    this.profileService
      .ensureLoaded()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loading.set(false),
        error: () => {
          this.loading.set(false);
          this.errorMessage.set(GENERIC_LOAD_ERROR);
        },
      });
  }

  selectProfile(profile: PlayerProfile): void {
    this.profileService.select(profile.id);

    // Den Stand holt der Wächter auf dem Weg zur Planetenkarte — dort läuft er
    // auch dann zu Ende, wenn dieser Screen längst weg ist (Plan Phase 6).
    void this.router.navigateByUrl('/');
  }

  startCreate(): void {
    this.creating.set(true);
  }

  cancelCreate(): void {
    this.creating.set(false);
    this.createForm.reset({ displayName: '', avatar: AVAILABLE_AVATARS[0] });
  }

  submitCreate(): void {
    if (this.createForm.invalid || this.submittingCreate()) {
      return;
    }

    this.submittingCreate.set(true);
    const { displayName, avatar } = this.createForm.getRawValue();

    this.profileService
      .create(displayName, avatar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submittingCreate.set(false);
          this.cancelCreate();
        },
        error: () => {
          this.submittingCreate.set(false);
          this.errorMessage.set(GENERIC_CREATE_ERROR);
        },
      });
  }

  askDelete(profile: PlayerProfile, event: Event): void {
    event.stopPropagation();
    this.profileToDelete.set(profile);
    this.deleteDialog()?.nativeElement.showModal();
  }

  cancelDelete(): void {
    this.deleteDialog()?.nativeElement.close();
    this.profileToDelete.set(null);
  }

  confirmDelete(): void {
    const profile = this.profileToDelete();

    if (profile === null || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.profileService
      .remove(profile.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.cancelDelete();
        },
        error: () => {
          this.deleting.set(false);
          this.errorMessage.set(GENERIC_DELETE_ERROR);
          this.cancelDelete();
        },
      });
  }
}
