import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

const WRONG_CREDENTIALS_MESSAGE = 'E-Mail oder Passwort stimmt nicht.';

/**
 * Anmeldung für Erwachsene — kommt einmal pro Gerät, danach nie wieder ins
 * Blickfeld des Kindes (Plan Phase 3). Kein Mockup dafür; Struktur ist in der
 * Phasendatei festgelegt, siehe `docs/design/README.md` → „Bewusste Abweichungen".
 */
@Component({
  selector: 'qst-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService
      .login(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/';

          void this.router.navigateByUrl(redirectTo);
        },
        error: () => {
          this.submitting.set(false);
          // Keine Rohfehlermeldung, keine Statusnummer — nur dieser eine Satz,
          // egal ob 401 oder ein anderer Fehlschlag (Phase 3, Design-Deckung).
          this.errorMessage.set(WRONG_CREDENTIALS_MESSAGE);
        },
      });
  }
}
