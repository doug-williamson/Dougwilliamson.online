import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@foliokit/cms-core';

/**
 * Login page used instead of FolioKit's AdminLoginComponent because
 * `withComponentInputBinding()` sets every input from route query/params/data.
 * Keys missing from the URL (e.g. `redirectTo`) become `undefined` and override
 * input defaults, so `router.navigate([this.redirectTo()])` throws NG04008.
 *
 * This component avoids `input()` names that collide with common query keys and
 * navigates with a fixed post-login URL.
 */
@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 class="text-3xl font-bold tracking-tight">Admin</h1>
      <p class="text-sm text-gray-500">Sign in to manage content</p>
      <button mat-raised-button color="primary" (click)="signIn()">
        Sign in with Google
      </button>
      @if (error()) {
        <p class="text-sm text-red-600">{{ error() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/posts');
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
      await this.router.navigateByUrl('/posts');
    } catch (err) {
      console.error('[Auth] signInWithGoogle failed:', err);
      this.error.set('Sign-in failed. Please try again.');
    }
  }
}
