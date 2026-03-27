import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@foliokit/cms-core';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Admin Login</h1>
        <p>Sign in to manage your site.</p>
        @if (error()) {
          <div class="error">{{ error() }}</div>
        }
        <button (click)="signIn()" [disabled]="loading()">
          {{ loading() ? 'Signing in...' : 'Sign in with Google' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: 2rem;
    }

    .login-card {
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
    }

    p {
      color: #666;
      margin: 0 0 2rem;
    }

    button {
      width: 100%;
      padding: 0.75rem 1.5rem;
      background: #0C2340;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    button:hover:not(:disabled) {
      opacity: 0.9;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error {
      background: #fee;
      color: #c00;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async signIn(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (e) {
      this.error.set('Sign-in failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
