import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@foliokit/cms-core';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  template: `
    <div class="flex min-h-screen items-center justify-center p-8 bg-[var(--bg)]">
      <div
        class="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl p-8"
        style="background: var(--surface-0); box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);"
      >
        <!-- Logo mark: navy square with gold dot -->
        <div
          class="relative flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
          style="background: var(--text-accent); font-family: var(--font-display);"
          aria-hidden="true"
        >
          DW
          <span
            class="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full"
            style="background: var(--logo-dot);"
          ></span>
        </div>

        <!-- Heading + subtitle -->
        <div class="flex flex-col items-center gap-1 text-center">
          <h1
            class="text-2xl font-bold tracking-tight"
            style="font-family: var(--font-display);"
          >
            Doug Williamson
          </h1>
          <p class="text-sm text-gray-500">Sign in to continue</p>
        </div>

        <!-- Sign-in button -->
        <button
          mat-flat-button
          color="primary"
          style="width: 100%;"
          (click)="signIn()"
        >
          Sign in with Google
        </button>

        @if (error()) {
          <p class="text-sm text-red-600" data-testid="error">{{ error() }}</p>
        }
      </div>
    </div>
  `,
})
export class LoginPageComponent implements OnInit {
  readonly redirectTo = input('/dashboard');

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.redirectTo()]);
    }
  }

  async signIn(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
      if (!this.authService.isAdmin()) {
        await this.authService.signOut();
        this.error.set('Access denied. This account is not authorized.');
        return;
      }
      await this.router.navigate([this.redirectTo()]);
    } catch {
      this.error.set('Sign-in failed. Please try again.');
    }
  }
}
