import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  ADMIN_EMAIL,
  AuthService,
  FIREBASE_AUTH,
} from '@foliokit/cms-core';
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
  type Auth,
} from 'firebase/auth';

/**
 * Login page used instead of FolioKit's AdminLoginComponent because
 * `withComponentInputBinding()` sets every input from route query/params/data.
 * Keys missing from the URL (e.g. `redirectTo`) become `undefined` and override
 * input defaults, so `router.navigate([this.redirectTo()])` throws NG04008.
 *
 * Uses `signInWithRedirect` instead of `AuthService.signInWithGoogle()` (popup)
 * to avoid Cross-Origin-Opener-Policy console errors from `window.closed` /
 * `window.close` on the Google OAuth window.
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
  private readonly auth = inject(FIREBASE_AUTH) as Auth | null;
  private readonly authService = inject(AuthService);
  private readonly adminEmail = inject(ADMIN_EMAIL, { optional: true });
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    if (this.auth) {
      try {
        const cred = await getRedirectResult(this.auth);
        if (cred?.user) {
          await this.finishAfterGoogle(cred.user.email ?? null);
          return;
        }
      } catch (err) {
        console.error('[Auth] getRedirectResult failed:', err);
        this.error.set('Sign-in failed. Please try again.');
      }
    }
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/posts');
    }
  }

  async signIn(): Promise<void> {
    if (!this.auth) {
      this.error.set('Auth is not available.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'login' });
      await signInWithRedirect(this.auth, provider);
    } catch (err) {
      console.error('[Auth] signInWithRedirect failed:', err);
      this.error.set('Sign-in failed. Please try again.');
    }
  }

  private async finishAfterGoogle(email: string | null): Promise<void> {
    const matchesToken =
      email != null && this.adminEmail != null && email === this.adminEmail;
    const ok = this.authService.isAdmin() || matchesToken;
    if (!ok) {
      await this.authService.signOut();
      this.error.set('Access denied. This account is not authorized.');
      return;
    }
    await this.router.navigateByUrl('/posts');
  }
}
